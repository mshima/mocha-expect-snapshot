// @ts-check
import configs from '@yeoman/eslint';
import { config } from 'typescript-eslint';

export default config(...configs, { ignores: ['test'] });
