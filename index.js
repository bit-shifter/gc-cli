export {namespacedClassVisitor} from './src/flatten';
export {rootNamespaceVisitor} from './src/rootnstocjs';
export {moduleIdVisitor} from './src/module-id-converter';
export {namespacedIIFEClassVisitor} from './src/iife-flatten';
export {cjsRequireRemoverVisitor} from './src/cjs-require-remover';
export {flattenProgramIIFEVisitor} from './src/flatten-program-iife';
export {flattenMemberExpression} from './src/flatten-member-expression';
export {verifyVarIsAvailableVisitor} from './src/verify-var-is-available';
export {namespaceAliasExpanderVisitor} from './src/namespace-alias-expander';
export {varNamespaceAliasExpanderVisitor} from './src/var-namespace-alias-expander';
export {addRequireForGlobalIdentifierVisitor} from './src/add-require-for-global-identifier';
