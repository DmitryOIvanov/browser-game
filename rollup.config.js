import terser from '@rollup/plugin-terser';

export default {
    input: 'src/index.js',
    output: {
        format: 'es',
        file: 'bundled_src.js',
    },
    plugins: [terser()]
}
