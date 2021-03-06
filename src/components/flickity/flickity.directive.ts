declare let require: any;

import {
  ElementRef, Directive, OnDestroy, Input, Output, EventEmitter, AfterContentInit
} from '@angular/core';

// import * as Flickity from 'flickity';
const Flickity = require('flickity');

import { FlickityOptions } from "../../interfaces/flickity-options.interface";

@Directive({ selector: '[flickity]' })
export class FlickityDirective implements AfterContentInit, OnDestroy {

  @Input('flickity') config: FlickityOptions = {};
  @Output() slideSelect = new EventEmitter<number>();
  @Output() cellStaticClick = new EventEmitter<number>();
  @Output() childrenUpdated = new EventEmitter<void>();

  private flkty: Flickity;
  private appendElements: HTMLElement[] = [];
  private childrenUpdateInterval = 300;

  constructor(private el: ElementRef) {
    setInterval(() => this.updateElements(), this.childrenUpdateInterval);
  }

  ngAfterContentInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  init() {
    let config = this.config;

    if (this.flkty) {
      config['initialIndex'] = this.flkty.selectedIndex;
      this.flkty.destroy();
    }

    this.flkty = new Flickity(this.el.nativeElement, config);

    this.flkty.on('select', () => {
      this.slideSelect.emit(this.selectedIndex);
    });

    this.flkty.on('staticClick', (_event: any, _pointer: any, _cellElement: any, cellIndex: any) => {
      this.cellStaticClick.emit(cellIndex);
    });
  }

  destroy() {
    if (!this.flkty) {
      return;
    }

    this.flkty.destroy();
  }

  resize() {
    if (!this.flkty) {
      return;
    }

    this.flkty.resize();
  }

  reposition() {
    if (!this.flkty) {
      return;
    }

    this.flkty.reposition();
  }

  previous() {
    if (!this.flkty) {
      return;
    }

    this.flkty.previous();
  }

  previousAvailable(): boolean {
    if (!this.selectedIndex) {
      return false;
    }

    return this.selectedIndex > 0;
  }

  next() {
    if (!this.flkty) {
      return;
    }

    this.flkty.next();
  }

  nextAvailable(): boolean {
    if (!this.selectedIndex || !this.slides) {
      return false;
    }

    return this.selectedIndex < this.slides - 1;
  }

  get selectedIndex(): number | undefined {
    if (!this.flkty) {
      return;
    }

    return this.flkty.selectedIndex;
  }

  get cells(): number | undefined {
    if (!this.flkty) {
      return;
    }

    return this.flkty.cells.length;
  }

  get slides(): number | undefined {
    if (!this.flkty) {
      return;
    }

    return this.flkty['slides'].length;
  }

  append(el: HTMLElement) {
    this.appendElements.push(el);
  }

  prepend(el: HTMLElement) {
    this.flkty.prepend(el);
  }

  private updateElements() {
    if (!this.flkty || this.appendElements.length == 0) {
      return;
    }

    this.appendElements.forEach(el => this.flkty.append(el));
    this.appendElements = [];

    this.resize();
    this.childrenUpdated.emit();
  }
}
