import { fileURLToPath, URL } from 'node:url'
import path from 'path'
import typescript from 'rollup-plugin-typescript2'
import terser from '@rollup/plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import alias from '@rollup/plugin-alias'
import { dts } from 'rollup-plugin-dts'
import strip from '@rollup/plugin-strip'
import { globSync } from 'glob'
import pkg from './package.json' assert { type: 'json' }

const isDev = process.env.BUILD === 'development'
const sourceMap = isDev ? 'inline' : true

function createPlugins(format) {
    const plugins = [
        typescript({
            tsconfig: './tsconfig.json',
            tsconfigOverride: format !== 'umd' ? {} : { compilerOptions: { declaration: false } },
        }),
    ]

    if (format === 'umd') {
        plugins.push(
            nodeResolve({
                browser: true,
            }),
            commonjs(),
        )
    }

    if (!isDev) {
        plugins.push(
            terser({
                module: true,
                compress: {
                    ecma: 2015,
                    pure_getters: true,
                },
            }),
            strip(),
            // del({ targets: 'dist/*' }),
        )
    }

    return plugins
}

export default [
    {
        input: Object.fromEntries(
            globSync('src/**/*.ts').map((file) => [
                path.relative('src', file.slice(0, file.length - path.extname(file).length)),
                fileURLToPath(new URL(file, import.meta.url)),
            ]),
        ),
        external: [...Object.keys(pkg.dependencies ?? {})],
        plugins: createPlugins('es'),
        output: [
            {
                dir: 'dist/es',
                format: 'es',
                sourcemap: sourceMap,
            },
        ],
    },
    {
        input: './src/main.ts',
        plugins: createPlugins('umd'),
        output: [
            {
                file: 'dist/umd/index.umd.js',
                format: 'umd',
                name: pkg.buildOptions.globalName,
                sourcemap: sourceMap,
            },
        ],
    },
    {
        input: './dist/es/main.d.ts',
        plugins: [
            alias({
                entries: { '@': fileURLToPath(new URL('./dist/es', import.meta.url)) },
            }),
            dts(),
        ],
        output: [
            {
                file: 'dist/global.d.ts',
            },
        ],
    },
]
