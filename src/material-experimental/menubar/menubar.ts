/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewEncapsulation, ChangeDetectionStrategy} from '@angular/core';
import {CdkMenuBar, CdkMenuGroup, CDK_MENU, MenuStack} from '@angular/cdk-experimental/menu';

/**
 * A material design Menubar adhering to the functionality of CdkMenuBar. MatMenubar
 * should contain MatMenubarItems which trigger their own sub-menus.
 */
@Component({
  selector: 'mat-menubar',
  exportAs: 'matMenubar',
  templateUrl: 'menubar.html',
  styleUrls: ['menubar.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'role': 'menubar',
    'class': 'cdk-menu-bar mat-menubar',
    'tabindex': '0',
    '[attr.aria-orientation]': 'orientation',
  },
  providers: [
    {provide: CdkMenuGroup, useExisting: MatMenuBar},
    {provide: CdkMenuBar, useExisting: MatMenuBar},
    {provide: CDK_MENU, useExisting: MatMenuBar},
    {provide: MenuStack, useClass: MenuStack},
  ],
})
export class MatMenuBar extends CdkMenuBar {}
