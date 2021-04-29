/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate, parallel} from '@angular/cdk/testing';
import {TabNavBarHarnessFilters, TabLinkHarnessFilters} from './tab-harness-filters';
import {MatTabLinkHarness} from './tab-link-harness';

/** Harness for interacting with an MDC-based mat-tab-nav-bar in tests. */
export class MatTabNavBarHarness extends ComponentHarness {
  /** The selector for the host element of a `MatTabNavBar` instance. */
  static hostSelector = '.mat-mdc-tab-nav-bar';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatTabNavBar` that meets
   * certain criteria.
   * @param options Options for filtering which tab nav bar instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: TabNavBarHarnessFilters = {}): HarnessPredicate<MatTabNavBarHarness> {
    return new HarnessPredicate(MatTabNavBarHarness, options);
  }

  /**
   * Gets the list of links in the nav bar.
   * @param filter Optionally filters which links are included.
   */
  async getLinks(filter: TabLinkHarnessFilters = {}): Promise<MatTabLinkHarness[]> {
    return this.locatorForAll(MatTabLinkHarness.with(filter))();
  }

  /** Gets the active link in the nav bar. */
  async getActiveLink(): Promise<MatTabLinkHarness> {
    const links = await this.getLinks();
    const isActive = await parallel(() => links.map(t => t.isActive()));
    for (let i = 0; i < links.length; i++) {
      if (isActive[i]) {
        return links[i];
      }
    }
    throw new Error('No active link could be found.');
  }

  /**
   * Clicks a link inside the nav bar.
   * @param filter An optional filter to apply to the child link. The first link matching the filter
   *     will be clicked.
   */
  async clickLink(filter: TabLinkHarnessFilters = {}): Promise<void> {
    const tabs = await this.getLinks(filter);
    if (!tabs.length) {
      throw Error(`Cannot find mat-tab-link matching filter ${JSON.stringify(filter)}`);
    }
    await tabs[0].click();
  }
}
