/* eslint-disable class-methods-use-this */
/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import ChildrenSorterStrategy from './ChildrenSorterStrategy';

/**
 * @class
 * @extends mindplot.layout.ChildrenSorterStrategy
 */
class AbstractBasicSorter extends ChildrenSorterStrategy {
  computeChildrenIdByHeights(treeSet, node) {
    const result = {};
    this._computeChildrenHeight(treeSet, node, result);
    return result;
  }

  _getVerticalPadding() {
    return AbstractBasicSorter.INTERNODE_VERTICAL_PADDING;
  }

  _computeChildrenHeight(treeSet, node, heightCache) {
    // 2* Top and down padding;
    const height = node.getSize().height + this._getVerticalPadding() * 2;

    let result;
    const children = treeSet.getChildren(node);
    if (children.length === 0 || node.areChildrenShrunken()) {
      result = height;
    } else {
      let childrenHeight = 0;

      children.forEach(((child) => {
        childrenHeight += this._computeChildrenHeight(treeSet, child, heightCache);
      }));

      result = Math.max(height, childrenHeight);
    }

    if (heightCache) {
      // eslint-disable-next-line no-param-reassign
      heightCache[node.getId()] = result;
    }

    return result;
  }

  _getSortedChildren(treeSet, node) {
    const result = treeSet.getChildren(node);
    result.sort((a, b) => a.getOrder() - b.getOrder());
    return result;
  }

  _getRelativeDirection(reference, position) {
    const offset = position.x - reference.x;
    return offset >= 0 ? 1 : -1;
  }
}

/**
 * @constant
 * @type {Number}
 * @default
 */
AbstractBasicSorter.INTERNODE_VERTICAL_PADDING = 5;
/**
 * @constant
 * @type {Number}
 * @default
 */
AbstractBasicSorter.INTERNODE_HORIZONTAL_PADDING = 30;

export default AbstractBasicSorter;
