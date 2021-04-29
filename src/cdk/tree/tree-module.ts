/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CdkTreeNodeOutlet} from './outlet';
import {CdkTreeNodePadding} from './padding';
import {CdkTreeNodeToggle} from './toggle';
import {CdkTree, CdkTreeNode} from './tree';
import {CdkTreeNodeDef} from './node';
import {CdkNestedTreeNode} from './nested-node';

const EXPORTED_DECLARATIONS = [
  CdkNestedTreeNode,
  CdkTreeNodeDef,
  CdkTreeNodePadding,
  CdkTreeNodeToggle,
  CdkTree,
  CdkTreeNode,
  CdkTreeNodeOutlet,
];

@NgModule({
  exports: EXPORTED_DECLARATIONS,
  declarations: EXPORTED_DECLARATIONS,
})
export class CdkTreeModule {}
