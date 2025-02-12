import {invoke} from "@tauri-apps/api/core";
import {error} from "../tools/message";
import useRuntimeStore from "../store/runtime";
import {SimxPlugin} from "../types/plugin";
import {sep} from "@tauri-apps/api/path";

// 检查本地环境状态
/**
 * `checkEnv` 函数用于检查和初始化应用程序的运行环境。
 * 它执行以下操作：
 * - 确定 `simx_root_dir` 目录路径，如果未设置，则使用默认路径并存储到 `localStorage`。
 * - 将 `simx_root_dir` 添加到运行时状态中，以便其他部分可以使用此路径。
 * - 检查与中央仓库的连接，如果无法连接，则显示错误提示。
 * - 检查并初始化基础目录结构，包括引擎目录、配置文件夹、插件信息文件夹（extension）、库缓存文件夹（library）和日志文件夹（logs）。
 * 如果配置文件夹不存在，则使用默认配置；如果插件配置不存在，则尝试自动修复。
 * @returns 返回一个 Promise，表示环境检查和初始化操作的完成。
 */
export const checkEnv = async () => {
    const runtime = useRuntimeStore();
    let path = await invoke("get_current_dir")

    // 加到runtime，其他地方可能会用到这个路径
    runtime.engineCorePath = path + sep() + "data";
    // 检查中央仓库是否可以连通，不能就报个错误提示一下
    // checkReceptionistLink();
};

// 初始化配置
export const initConfig = async () => {
    const runtime = useRuntimeStore();
    let simx_root_dir = runtime.engineCorePath;
    // 系统插件列表
    let plugins: SimxPlugin[] = [];
    // 尝试初始化扩展信息（搜索引擎目录下的扩展目录），此目录下每个文件夹都是一个扩展集合（simx以域名区分，可以是二级域名）
    let response: any = await invoke("dir_list", {
        path: simx_root_dir + sep() + "extension",
    });
    // 继续搜索二级域名中的包扩展
    for (let i = 0; i < response.dirs.length; i++) {
        let dir = response.dirs[i];
        let dir_response: any = await invoke("dir_list", {path: dir.path});
        // 检查是否存在index.json文件，如果存在，加载
        if (dir_response.files.find((file: any) => file.name === "index.json")) {
            let index_file = dir_response.files.find(
                (file: any) => file.name === "index.json"
            );
            let index_file_response: any = await invoke("read_file", {
                path: index_file.path,
            });
            console.log("DDD: index_file_response.json: ", index_file_response);

            let plugin: SimxPlugin;
            try {
                plugin = JSON.parse(index_file_response);
            } catch (e) {
                error("扩展配置文件 " + index_file.path + " 格式错误，解析失败");
                continue;
            }
            plugins.push(plugin);
        }
    }
    // 加载包扩展的信息到系统
    runtime.plugins = plugins;
};

// 初始化引擎/修复引擎
/**
 * 初始化引擎的异步函数。（暂时放弃，引擎默认附带）
 * 检查指定的引擎目录是否存在，如果不存在则创建该目录。
 * 根据操作系统类型确定引擎文件名（Windows 为 engine.exe，其他系统为 engine）。
 * 检查引擎执行文件是否存在，如果不存在则尝试从服务器下载并修复。
 * 下载完成后，如果是非 Windows 系统，尝试赋予执行权限。
 * @param simx_engine_dir 引擎所在的目录路径
 */
// export const initEngine = async (simx_engine_dir: string) => {
//     if (!(await invoke("dir_exists", {path: simx_engine_dir}))) {
//         await invoke("dir_create", {path: simx_engine_dir});
//     }
//     let engine_file_name = "";
//     if (getOsInfo() == OsType.Windows) {
//         engine_file_name = "engine.exe";
//     } else {
//         engine_file_name = "engine";
//     }
//     // 继续检查引擎执行文件
//     if (
//         !(await invoke("check_file_exists", {
//             path: simx_engine_dir + "/" + engine_file_name,
//         }))
//     ) {
//         info("引擎文件不存在，设计器正在尝试自动修复...");
//         const config = useConfigStore();
//         // info("config: ", config);
//         // 这个url后续做成可配置的
//         let request_url =
//             config.rece_config.receptionist_server_url +
//             "/simx/getEngineRunner?version=" +
//             config.engine_config.engine_version;
//         download(
//             request_url,
//             simx_engine_dir + "/" + engine_file_name
//             // TODO: 这里可以添加进度条
//             // ({ progress, total }) =>
//             //     info(`Downloaded ${progress} of ${total} bytes`),
//         )
//             .then(() => {
//                 if (getOsInfo() != OsType.Windows) {
//                     // 调用赋权功能
//                     try {
//                         invoke("set_executable", {
//                             path: simx_engine_dir + "/" + engine_file_name,
//                         });
//                     } catch (e) {
//                         error(e as string, 1220);
//                     }
//                 }
//                 info("引擎文件修复成功");
//             })
//             .catch((err) => {
//                 error("引擎文件修复失败");
//                 error(err);
//             });
//     }
// };
