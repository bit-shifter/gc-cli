var chalk = require('chalk');
var through2 = require('through2');
var parse = require('recast').parse;
var print = require('recast').print;
var visit = require('ast-types').visit;

import {
	moduleIdVisitor,
	rootNamespaceVisitor,
	flattenMemberExpression,
	cjsRequireRemoverVisitor,
	verifyVarIsAvailableVisitor
} from 'global-compiler';

import {
	getFileNamespaceParts,
	transformASTAndPushToNextStream
} from './utils/utilities';

/**
 * Parses every streamed file and provides its AST.
 *
 * @returns {Function} Stream transform implementation which parses JS files.
 */
export function parseJSFile() {
	return through2.obj(function(vinylFile, encoding, callback) {
		console.log(chalk.green('Parsing'), chalk.bold(vinylFile.relative));

		var fileAST = parse(vinylFile.contents.toString());

		vinylFile.ast = fileAST;
		this.push(vinylFile);
		callback();
	});
}

/**
 * Given namespace roots flatten all classes referenced in those namespaces and require them.
 *
 * @param {String} namespaces - Comma separated list of root namespaces to convert to CJS.
 * @returns {Function} Stream transform implementation which replaces all global namespaced code with module references.
 */
export function convertGlobalsToRequires(namespaces) {
	var rootNamespaces = namespaces.split(',');

	return through2.obj(function(fileMetadata, encoding, callback) {
		var className = getFileNamespaceParts(fileMetadata).pop();

		rootNamespaceVisitor.initialize(rootNamespaces, fileMetadata.ast.program.body, className);
		transformASTAndPushToNextStream(fileMetadata, rootNamespaceVisitor, this, callback);
	});
}

/**
 * Certain required module IDs don't exist, this transform removes them.
 *
 * @param {Set<string>} moduleIDsToRemove - The module Ids to remove.
 * @returns {Function} Stream transform implementation which removes specified cjs requires.
 */
export function removeCJSModuleRequires(moduleIDsToRemove) {
	return through2.obj(function(fileMetadata, encoding, callback) {
		cjsRequireRemoverVisitor.initialize(moduleIDsToRemove);
		transformASTAndPushToNextStream(fileMetadata, cjsRequireRemoverVisitor, this, callback);
	});
}

/**
 * This transform is use case specific in that it replaces use of one i18n library with another.
 * The transform is multi-stage as it uses more generic transforms.
 *
 * @returns {Function} Stream transform implementation which replaces i18n usage with another library.
 */
export function transformI18nUsage() {
	return through2.obj(function(fileMetadata, encoding, callback) {
		//Verify that the i18n variable is free to use in this module, if not generate a variation on it that is.
		verifyVarIsAvailableVisitor.initialize();
		visit(fileMetadata.ast, verifyVarIsAvailableVisitor);
		var freeI18NVariation = verifyVarIsAvailableVisitor.getFreeVariation('i18n');

		//Convert all requires with a certain ID to another ID and variable identifer.
		var moduleIdsToConvert = new Map([['ct', ['br/I18n', freeI18NVariation]]]);
		moduleIdVisitor.initialize(moduleIdsToConvert);
		visit(fileMetadata.ast, moduleIdVisitor);

		//Replace all calls to a certain namespace with calls to the new i18n identifier.
		flattenMemberExpression.initialize(['ct', 'i18n'], freeI18NVariation);
		visit(fileMetadata.ast, flattenMemberExpression);

		this.push(fileMetadata);
		callback();
	});
}

/**
 * Parse AST and set it on the `contents` property of the FileMetadata argument passed into the transform.
 *
 * @returns {Function} Stream transform implementation which sets parsed AST on `contents` of FileMetadata.
 */
export function convertASTToBuffer() {
	return through2.obj(function(fileMetadata, encoding, callback) {
		var convertedCode = print(fileMetadata.ast, {wrapColumn: 200}).code;
		var convertedCodeBuffer = new Buffer(convertedCode);

		fileMetadata.contents = convertedCodeBuffer;
		this.push(fileMetadata);
		callback();
	});
}