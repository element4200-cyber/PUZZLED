import {build} from 'esbuild';
import {polyfillNode} from 'esbuild-plugin-polyfill-node';
await build({entryPoints:['launch.js'],outfile:'dist/launch.bundle.js',bundle:true,format:'esm',platform:'browser',minify:true,plugins:[polyfillNode()],define:{'process.env.NODE_ENV':'"production"'}});
