/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {
  BooleanInput,
  coerceBooleanProperty,
  coerceNumberProperty,
  NumberInput
} from '@angular/cdk/coercion';
import {normalizePassiveListenerOptions, Platform} from '@angular/cdk/platform';
import {
  AfterViewInit,
  Attribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Optional,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {ThemePalette} from '@angular/material-experimental/mdc-core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {MDCSliderAdapter, MDCSliderFoundation, Thumb} from '@material/slider';
import {Subscription} from 'rxjs';

/**
 * Visually, a 30px separation between tick marks looks best. This is very subjective but it is
 * the default separation we chose.
 */
const MIN_AUTO_TICK_SEPARATION = 30;

/**
 * Size of a tick marker for a slider. The size of a tick is based on the Material
 * Design guidelines and the MDC slider implementation.
 * TODO(devversion): ideally MDC would expose the tick marker size as constant
 */
const TICK_MARKER_SIZE = 2;

// TODO: disabled until we implement the new MDC slider.
/** Event options used to bind passive listeners. */
// tslint:disable-next-line:no-unused-variable
const passiveListenerOptions = normalizePassiveListenerOptions({passive: true});

// TODO: disabled until we implement the new MDC slider.
/** Event options used to bind active listeners. */
// tslint:disable-next-line:no-unused-variable
const activeListenerOptions = normalizePassiveListenerOptions({passive: false});

/**
 * Provider Expression that allows mat-slider to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)] and [formControl].
 * @docs-private
 */
export const MAT_SLIDER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatSlider),
  multi: true
};

/** A simple change event emitted by the MatSlider component. */
export class MatSliderChange {
  /** The MatSlider that changed. */
  source: MatSlider;

  /** The new value of the source slider. */
  value: number;
}

@Component({
  selector: 'mat-slider',
  templateUrl: 'slider.html',
  styleUrls: ['slider.css'],
  host: {
    'class': 'mat-mdc-slider mdc-slider mat-mdc-focus-indicator',
    'role': 'slider',
    'aria-orientation': 'horizontal',
    // The tabindex if the slider turns disabled is managed by the MDC foundation which
    // dynamically updates and restores the "tabindex" attribute.
    '[attr.tabindex]': 'tabIndex || 0',
    '[class.mdc-slider--discrete]': 'thumbLabel',
    '[class.mat-slider-has-ticks]': 'tickInterval !== 0',
    '[class.mdc-slider--display-markers]': 'tickInterval !== 0',
    '[class.mat-slider-thumb-label-showing]': 'thumbLabel',
    // Class binding which is only used by the test harness as there is no other
    // way for the harness to detect if mouse coordinates need to be inverted.
    '[class.mat-slider-invert-mouse-coords]': '_isRtl()',
    '[class.mat-slider-disabled]': 'disabled',
    '[class.mat-primary]': 'color == "primary"',
    '[class.mat-accent]': 'color == "accent"',
    '[class.mat-warn]': 'color == "warn"',
    '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',
    '(blur)': '_markAsTouched()',
  },
  exportAs: 'matSlider',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MAT_SLIDER_VALUE_ACCESSOR],
})
export class MatSlider implements AfterViewInit, OnChanges, OnDestroy, ControlValueAccessor {
  /** Event emitted when the slider value has changed. */
  @Output() readonly change: EventEmitter<MatSliderChange> = new EventEmitter<MatSliderChange>();

  /** Event emitted when the slider thumb moves. */
  @Output() readonly input: EventEmitter<MatSliderChange> = new EventEmitter<MatSliderChange>();

  /**
   * Emits when the raw value of the slider changes. This is here primarily
   * to facilitate the two-way binding for the `value` input.
   * @docs-private
   */
  @Output() readonly valueChange: EventEmitter<number> = new EventEmitter<number>();

  /** Tabindex for the slider. */
  @Input() tabIndex: number = 0;

  /** The color palette for this slider. */
  @Input() color: ThemePalette = 'accent';

  /**
   * Function that will be used to format the value before it is displayed
   * in the thumb label. Can be used to format very large number in order
   * for them to fit into the slider thumb.
   */
  @Input() displayWith: (value: number) => string | number;

  /** The minimum value that the slider can have. */
  @Input()
  get min(): number {
    return this._min;
  }
  set min(value: number) {
    this._min = coerceNumberProperty(value);
  }
  private _min = 0;

  /** The maximum value that the slider can have. */
  @Input()
  get max(): number {
    return this._max;
  }
  set max(value: number) {
    this._max = coerceNumberProperty(value);
  }
  private _max = 100;

  /** Value of the slider. */
  @Input()
  get value(): number|null {
    // If the value needs to be read and it is still uninitialized, initialize
    // it to the current minimum value.
    if (this._value === null) {
      this.value = this.min;
    }
    return this._value;
  }
  set value(value: number|null) {
    this._value = coerceNumberProperty(value);
  }
  private _value: number|null = null;

  /** The values at which the thumb will snap. */
  @Input()
  get step(): number {
    return this._step;
  }
  set step(v: number) {
    this._step = coerceNumberProperty(v, this._step);
  }
  private _step: number = 1;

  /**
   * How often to show ticks. Relative to the step so that a tick always appears on a step.
   * Ex: Tick interval of 4 with a step of 3 will draw a tick every 4 steps (every 12 values).
   */
  @Input()
  get tickInterval() {
    return this._tickInterval;
  }
  set tickInterval(value: number|'auto') {
    if (value === 'auto') {
      this._tickInterval = 'auto';
    } else if (typeof value === 'number' || typeof value === 'string') {
      this._tickInterval = coerceNumberProperty(value, this._tickInterval);
    } else {
      this._tickInterval = 0;
    }
  }
  private _tickInterval: number|'auto' = 0;

  /** Whether or not to show the thumb label. */
  @Input()
  get thumbLabel(): boolean {
    return this._thumbLabel;
  }
  set thumbLabel(value: boolean) {
    this._thumbLabel = coerceBooleanProperty(value);
  }
  private _thumbLabel: boolean = false;

  /** Whether the slider is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(disabled) {
    this._disabled = coerceBooleanProperty(disabled);
  }
  private _disabled = false;

  /** Adapter for the MDC slider foundation. */
  private _sliderAdapter: MDCSliderAdapter = {
    hasClass: (_className: string) => false,
    addClass: (_className: string) => {},
    removeClass: (_className: string) => {},
    getAttribute: (_attribute: string) => null,
    addThumbClass: (_className: string, _thumb: Thumb) => {},
    removeThumbClass: (_className: string, _thumb: Thumb) => {},
    getThumbKnobWidth: (_thumb: Thumb) => 0,
    getThumbBoundingClientRect: (_thumb: Thumb) => null!,
    getBoundingClientRect: () => null!,
    isRTL: () => false,
    setThumbStyleProperty: (_propertyName: string, _value: string, _thumb: Thumb) => {},
    removeThumbStyleProperty: (_propertyName: string, _thumb: Thumb) => {},
    setTrackActiveStyleProperty: (_propertyName: string, _value: string) => {},
    setValueIndicatorText: (_value: number, _thumb: Thumb) => {},
    updateTickMarks: () => {},
    setPointerCapture: (_pointerId: number) => {},
    emitChangeEvent: (_value: number, _thumb: Thumb) => {},
    emitInputEvent: (_value: number, _thumb: Thumb) => {},
    registerEventHandler: () => {},
    deregisterEventHandler: () => {},
    registerThumbEventHandler: () => {},
    deregisterThumbEventHandler: () => {},
    registerBodyEventHandler: () => {},
    deregisterBodyEventHandler: () => {},
    registerWindowEventHandler: () => {},
    deregisterWindowEventHandler: () => {},
    removeTrackActiveStyleProperty: (_propertyName: string) => {},
    emitDragStartEvent: (_value: number, _thumb: Thumb) => {},
    emitDragEndEvent: (_value: number, _thumb: Thumb) => {},
    getValueToAriaValueTextFn: () => null,
    getInputValue: () => '',
    setInputValue: (_value: string, _thumb: Thumb) => {},
    getInputAttribute: (_attribute: string, _thumb: Thumb) => null,
    setInputAttribute: (_attribute: string, _value: string) => {},
    removeInputAttribute: (_attribute: string) => {},
    focusInput: () => {},
    isInputFocused: (_thumb: Thumb) => false,
    registerInputEventHandler: (_thumb: Thumb, _evtType: string, _handler: any) => {},
    deregisterInputEventHandler: (_thumb: Thumb, _evtType: string, _handler: any) => {},
  };

  /** Instance of the MDC slider foundation for this slider. */
  private _foundation = new MDCSliderFoundation(this._sliderAdapter);

  /** Whether the MDC foundation has been initialized. */
  private _isInitialized = false;

  /** Function that notifies the control value accessor about a value change. */
  private _controlValueAccessorChangeFn: (value: number) => void = () => {};

  /** Subscription to the Directionality change EventEmitter. */
  private _dirChangeSubscription = Subscription.EMPTY;

  /** Function that marks the slider as touched. Registered via "registerOnTouch". */
  _markAsTouched: () => any = () => {};

  @ViewChild('thumbContainer') _thumbContainer: ElementRef<HTMLElement>;
  @ViewChild('track') _track: ElementRef<HTMLElement>;
  @ViewChild('pinValueMarker') _pinValueMarker: ElementRef<HTMLElement>;
  @ViewChild('trackMarker') _trackMarker: ElementRef<HTMLElement>;

  constructor(
      private _elementRef: ElementRef<HTMLElement>,
      private _ngZone: NgZone,
      private _platform: Platform,
      @Optional() private _dir: Directionality,
      @Attribute('tabindex') tabIndex: string,
      @Optional() @Inject(ANIMATION_MODULE_TYPE) public _animationMode?: string) {
    this.tabIndex = parseInt(tabIndex) || 0;

    if (this._dir) {
      this._dirChangeSubscription = this._dir.change.subscribe(() => {
        // In case the directionality changes, we need to refresh the rendered MDC slider.
        // Note that we need to wait until the page actually updated as otherwise the
        // client rectangle wouldn't reflect the new directionality.
        // TODO(devversion): ideally the MDC slider would just compute dimensions similarly
        // to the standard Material slider on "mouseenter".
        this._ngZone.runOutsideAngular(() => setTimeout(() => this._foundation.layout()));
      });
    }
  }

  ngAfterViewInit() {
    this._isInitialized = true;

    if (this._platform.isBrowser) {
      // The MDC slider foundation accesses DOM globals, so we cannot initialize the
      // foundation on the server. The foundation would be needed to move the thumb
      // to the proper position and to render the ticks.
      // this._foundation.init();

      // The standard Angular Material slider is always using discrete values. We always
      // want to enable discrete values and support ticks, but want to still provide
      // non-discrete slider visual looks if thumb label is disabled.
      // TODO(devversion): check if we can get a public API for this.
      // Tracked with: https://github.com/material-components/material-components-web/issues/5020
      (this._foundation as any).isDiscrete_ = true;

      // These bindings cannot be synced in the foundation, as the foundation is not
      // initialized and they cause DOM globals to be accessed (to move the thumb)
      this._syncStep();
      this._syncMax();
      this._syncMin();

      // Note that "value" needs to be synced after "max" and "min" because otherwise
      // the value will be clamped by the MDC foundation implementation.
      this._syncValue();
    }

    this._syncDisabled();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this._isInitialized) {
      return;
    }

    if (changes['step']) {
      this._syncStep();
    }
    if (changes['max']) {
      this._syncMax();
    }
    if (changes['min']) {
      this._syncMin();
    }
    if (changes['disabled']) {
      this._syncDisabled();
    }
    if (changes['value']) {
      this._syncValue();
    }
    if (changes['tickInterval']) {
      this._refreshTrackMarkers();
    }
  }

  ngOnDestroy() {
    this._dirChangeSubscription.unsubscribe();
    // The foundation cannot be destroyed on the server, as the foundation
    // has not be initialized on the server.
    if (this._platform.isBrowser) {
      this._foundation.destroy();
    }
  }

  /** Focuses the slider. */
  focus(options?: FocusOptions) {
    this._elementRef.nativeElement.focus(options);
  }

  /** Blurs the slider. */
  blur() {
    this._elementRef.nativeElement.blur();
  }

  /** Gets the display text of the current value. */
  get displayValue() {
    if (this.displayWith) {
      return this.displayWith(this.value!).toString();
    }
    return this.value!.toString() || '0';
  }

  /** Creates a slider change object from the specified value. */
  private _createChangeEvent(newValue: number): MatSliderChange {
    const event = new MatSliderChange();
    event.source = this;
    event.value = newValue;
    return event;
  }

  // TODO: disabled until we implement the new MDC slider.
  /** Emits a change event and notifies the control value accessor. */
  // tslint:disable-next-line:no-unused-variable
  private _emitChangeEvent(newValue: number) {
    this._controlValueAccessorChangeFn(newValue);
    this.valueChange.emit(newValue);
    this.change.emit(this._createChangeEvent(newValue));
  }

  // TODO: disabled until we implement the new MDC slider.
  /** Computes the CSS background value for the track markers (aka ticks). */
  // tslint:disable-next-line:no-unused-variable
  private _getTrackMarkersBackground(min: number, max: number, step: number) {
    if (!this.tickInterval) {
      return '';
    }

    const markerWidth = `${TICK_MARKER_SIZE}px`;
    const markerBackground =
        `linear-gradient(to right, currentColor ${markerWidth}, transparent 0)`;

    if (this.tickInterval === 'auto') {
      const trackSize = this._elementRef.nativeElement.getBoundingClientRect().width;
      const pixelsPerStep = trackSize * step / (max - min);
      const stepsPerTick = Math.ceil(MIN_AUTO_TICK_SEPARATION / pixelsPerStep);
      const pixelsPerTick = stepsPerTick * step;
      return `${markerBackground} 0 center / ${pixelsPerTick}px 100% repeat-x`;
    }

    // keep calculation in css for better rounding/subpixel behavior
    const markerAmount = `(((${max} - ${min}) / ${step}) / ${this.tickInterval})`;
    const markerBkgdLayout =
        `0 center / calc((100% - ${markerWidth}) / ${markerAmount}) 100% repeat-x`;
    return `${markerBackground} ${markerBkgdLayout}`;
  }

  /** Method that ensures that track markers are refreshed. */
  private _refreshTrackMarkers() {
    // MDC only checks whether the slider has markers once on init by looking for the
    // `mdc-slider--display-markers` class in the DOM, whereas we support changing and hiding
    // the markers dynamically. This is a workaround until we can get a public API for it. See:
    // https://github.com/material-components/material-components-web/issues/5020
    (this._foundation as any).hasTrackMarker_ = this.tickInterval !== 0;

    // TODO: disabled until we implement the new MDC slider.
    // this._foundation.setupTrackMarker();
  }

  /** Syncs the "step" input value with the MDC foundation. */
  private _syncStep() {
    // TODO: disabled until we implement the new MDC slider.
    // this._foundation.setStep(this.step);
  }

  /** Syncs the "max" input value with the MDC foundation. */
  private _syncMax() {
    // TODO: disabled until we implement the new MDC slider.
    // this._foundation.setMax(this.max);
  }

  /** Syncs the "min" input value with the MDC foundation. */
  private _syncMin() {
    // TODO: disabled until we implement the new MDC slider.
    // this._foundation.setMin(this.min);
  }

  /** Syncs the "value" input binding with the MDC foundation. */
  private _syncValue() {
    // TODO: disabled until we implement the new MDC slider.
    // this._foundation.setValue(this.value!);
  }

  /** Syncs the "disabled" input value with the MDC foundation. */
  private _syncDisabled() {
    // TODO: disabled until we implement the new MDC slider.
    // this._foundation.setDisabled(this.disabled);
  }

  /** Whether the slider is displayed in RTL-mode. */
  _isRtl(): boolean {
    return this._dir && this._dir.value === 'rtl';
  }

  /**
   * Registers a callback to be triggered when the value has changed.
   * Implemented as part of ControlValueAccessor.
   * @param fn Callback to be registered.
   */
  registerOnChange(fn: any) {
    this._controlValueAccessorChangeFn = fn;
  }

  /**
   * Registers a callback to be triggered when the component is touched.
   * Implemented as part of ControlValueAccessor.
   * @param fn Callback to be registered.
   */
  registerOnTouched(fn: any) {
    this._markAsTouched = fn;
  }

  /**
   * Sets whether the component should be disabled.
   * Implemented as part of ControlValueAccessor.
   * @param isDisabled
   */
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
    this._syncDisabled();
  }

  /**
   * Sets the model value.
   * Implemented as part of ControlValueAccessor.
   * @param value
   */
  writeValue(value: any) {
    this.value = value;
    this._syncValue();
  }

  static ngAcceptInputType_min: NumberInput;
  static ngAcceptInputType_max: NumberInput;
  static ngAcceptInputType_value: NumberInput;
  static ngAcceptInputType_step: NumberInput;
  static ngAcceptInputType_tickInterval: NumberInput;
  static ngAcceptInputType_thumbLabel: BooleanInput;
  static ngAcceptInputType_disabled: BooleanInput;
}
