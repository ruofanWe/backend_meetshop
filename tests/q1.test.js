const { invertBinaryTree } = require('../src/q1-binary-tree');

describe('Binary Tree Inversion', () => {
    test('Standard case', () => {
        const input = [5, 3, 8, 1, 7, 2, 6];
        expect(invertBinaryTree(input)).toEqual([5, 8, 3, 6, 2, 7, 1]);
    });

    test('Simple tree', () => {
        const input = [6, 8, 9];
        expect(invertBinaryTree(input)).toEqual([6, 9, 8]);
    });

    test('Empty tree', () => {
        const input = [];
        expect(invertBinaryTree(input)).toEqual([]);
    });

    test('Single node', () => {
        const input = [1];
        expect(invertBinaryTree(input)).toEqual([1]);
    });

    test('Complex tree with negative values', () => {
        const input = [5, 3, 8, 1, 7, 2, 6, 100, 3, -1];
        expect(invertBinaryTree(input)).toEqual([5, 8, 3, 6, 2, 7, 1, -1, 3, 100]);
    });
});