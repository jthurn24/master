/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Input} from '@angular/core';

@Component({
  selector: 'basic-table',
  template: `
  <table mat-table [dataSource]="rows" class="mat-elevation-z8">

    <ng-container matColumnDef="a">
      <th mat-header-cell *matHeaderCellDef> A </th>
      <td mat-cell *matCellDef="let cell"> {{cell.a}} </td>
    </ng-container>

    <ng-container matColumnDef="b">
      <th mat-header-cell *matHeaderCellDef> B </th>
      <td mat-cell *matCellDef="let cell"> {{cell.b}} </td>
    </ng-container>

    <ng-container matColumnDef="c">
      <th mat-header-cell *matHeaderCellDef> C </th>
      <td mat-cell *matCellDef="let cell"> {{cell.c}} </td>
    </ng-container>

    <ng-container matColumnDef="d">
      <th mat-header-cell *matHeaderCellDef> D </th>
      <td mat-cell *matCellDef="let cell"> {{cell.d}} </td>
    </ng-container>

    <ng-container matColumnDef="e">
      <th mat-header-cell *matHeaderCellDef> E </th>
      <td mat-cell *matCellDef="let cell"> {{cell.e}} </td>
    </ng-container>

    <ng-container matColumnDef="f">
      <th mat-header-cell *matHeaderCellDef> F </th>
      <td mat-cell *matCellDef="let cell"> {{cell.f}} </td>
    </ng-container>

    <ng-container matColumnDef="g">
      <th mat-header-cell *matHeaderCellDef> G </th>
      <td mat-cell *matCellDef="let cell"> {{cell.g}} </td>
    </ng-container>

    <ng-container matColumnDef="h">
      <th mat-header-cell *matHeaderCellDef> H </th>
      <td mat-cell *matCellDef="let cell"> {{cell.h}} </td>
    </ng-container>

    <ng-container matColumnDef="i">
      <th mat-header-cell *matHeaderCellDef> I </th>
      <td mat-cell *matCellDef="let cell"> {{cell.i}} </td>
    </ng-container>

    <ng-container matColumnDef="j">
      <th mat-header-cell *matHeaderCellDef> J </th>
      <td mat-cell *matCellDef="let cell"> {{cell.j}} </td>
    </ng-container>

    <ng-container matColumnDef="k">
      <th mat-header-cell *matHeaderCellDef> K </th>
      <td mat-cell *matCellDef="let cell"> {{cell.k}} </td>
    </ng-container>

    <ng-container matColumnDef="l">
      <th mat-header-cell *matHeaderCellDef> L </th>
      <td mat-cell *matCellDef="let cell"> {{cell.l}} </td>
    </ng-container>

    <ng-container matColumnDef="m">
      <th mat-header-cell *matHeaderCellDef> M </th>
      <td mat-cell *matCellDef="let cell"> {{cell.m}} </td>
    </ng-container>

    <ng-container matColumnDef="n">
      <th mat-header-cell *matHeaderCellDef> N </th>
      <td mat-cell *matCellDef="let cell"> {{cell.n}} </td>
    </ng-container>

    <ng-container matColumnDef="o">
      <th mat-header-cell *matHeaderCellDef> O </th>
      <td mat-cell *matCellDef="let cell"> {{cell.o}} </td>
    </ng-container>

    <ng-container matColumnDef="p">
      <th mat-header-cell *matHeaderCellDef> P </th>
      <td mat-cell *matCellDef="let cell"> {{cell.p}} </td>
    </ng-container>

    <ng-container matColumnDef="q">
      <th mat-header-cell *matHeaderCellDef> Q </th>
      <td mat-cell *matCellDef="let cell"> {{cell.q}} </td>
    </ng-container>

    <ng-container matColumnDef="r">
      <th mat-header-cell *matHeaderCellDef> R </th>
      <td mat-cell *matCellDef="let cell"> {{cell.r}} </td>
    </ng-container>

    <ng-container matColumnDef="s">
      <th mat-header-cell *matHeaderCellDef> S </th>
      <td mat-cell *matCellDef="let cell"> {{cell.s}} </td>
    </ng-container>

    <ng-container matColumnDef="t">
      <th mat-header-cell *matHeaderCellDef> T </th>
      <td mat-cell *matCellDef="let cell"> {{cell.t}} </td>
    </ng-container>

    <tr mat-header-row *matHeaderRowDef="cols"></tr>
    <tr mat-row *matRowDef="let row; columns: cols;"></tr>
  </table>
  `,
  styles: ['table { width: 100% }', 'th.mat-header-cell, td.mat-cell { padding: 0px 20px }'],
})
export class BasicTable {
  @Input() cols: string[];
  @Input() rows: Record<string, string>[];
}
