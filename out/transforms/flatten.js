"use strict";
Object.defineProperties(exports, {
  flattenNamespace: {get: function() {
      return flattenNamespace;
    }},
  __esModule: {value: true}
});
var builders = require('ast-types').builders;
var classConstructor = null;
function flattenNamespace($__3, fullyQualifiedName) {
  var programStatements = $traceurRuntime.assertObject($__3).body;
  fullyQualifiedName = fullyQualifiedName.split('.');
  for (var $__1 = programStatements[Symbol.iterator](),
      $__2; !($__2 = $__1.next()).done; ) {
    var programStatement = $__2.value;
    {
      var $__4 = $traceurRuntime.assertObject(programStatement),
          type = $__4.type,
          expression = $__4.expression;
      if (type === 'ExpressionStatement' && expression.type === 'AssignmentExpression') {
        flattenIfNamespacedExpressionStatement(programStatement, fullyQualifiedName);
      }
    }
  }
  replaceConstructorExpressionWithDeclaration(programStatements);
}
function flattenIfNamespacedExpressionStatement(programStatement, fullyQualifiedName) {
  var expression = $traceurRuntime.assertObject(programStatement).expression;
  var className = fullyQualifiedName[fullyQualifiedName.length - 1];
  if (isNamespacedConstructorMemberExpression(expression.left, fullyQualifiedName)) {
    createConstructorFunctionDeclaration(programStatement, className);
  } else if (true) {
    flattenClassMethod(expression, className, 'myMethod');
  }
}
function isNamespacedConstructorMemberExpression(assignmentLeftExpression, fullyQualifiedName) {
  return fullyQualifiedName.reduceRight(isNamespacedClassConstructor, assignmentLeftExpression);
}
function isNamespacedClassConstructor(expression, namespacePart) {
  if (typeof expression === 'boolean') {
    return false;
  } else if (expression.type === 'Identifier' && expression.name === namespacePart) {
    return true;
  } else if (expression.type === 'MemberExpression' && expression.property.name === namespacePart) {
    return expression.object;
  }
  return false;
}
function createConstructorFunctionDeclaration(programStatement, className) {
  var functionExpression = $traceurRuntime.assertObject($traceurRuntime.assertObject(programStatement).expression).right;
  var classConstructorDeclaration = builders.functionDeclaration(builders.identifier(className), functionExpression.params, functionExpression.body);
  classConstructor = {
    programStatement: programStatement,
    classConstructorDeclaration: classConstructorDeclaration
  };
}
function flattenClassMethod(assignmentExpression, className, methodName) {
  var classProto = builders.memberExpression(builders.identifier(className), builders.identifier('prototype'), false);
  assignmentExpression.left = builders.memberExpression(classProto, builders.identifier(methodName), false);
}
function replaceConstructorExpressionWithDeclaration(programStatements) {
  var $__3 = $traceurRuntime.assertObject(classConstructor),
      programStatement = $__3.programStatement,
      classConstructorDeclaration = $__3.classConstructorDeclaration;
  console.log(programStatement);
  var classConstructorExpression = programStatements.indexOf(programStatement);
  if (classConstructorExpression > -1) {}
}
