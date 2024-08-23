module.exports = {
    root: true,
    env: { browser: true, es2020: true, node: true },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['eslint-plugin-import'],
    settings: {
        'import/resolver': {
            typescript: {
                project: ['apps/**/tsconfig.json', 'packages/**/tsconfig.json'],
            },
            node: {
                extensions: ['js', '.ts', '.d.ts', '.tsx', '.mjs', '.cjs'],
            },
        },
    },
    rules: {
        'import/order': [
            'error',
            {
                groups: [
                    'type',
                    'builtin',
                    'external',
                    'internal',
                    'parent',
                    'sibling',
                    'index',
                    'object',
                    'unknown',
                ],
                pathGroups: [
                    {
                        pattern: '@/**',
                        group: 'external',
                        position: 'after',
                    },
                ],
            },
        ],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-types': 'off',
    },
}
