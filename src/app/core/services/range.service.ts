import { Injectable } from '@angular/core';
import { IAnnotation } from '../models/annotation.model';

@Injectable({ providedIn: 'root' })
export class RangeService {
  getSelectionOffsets(
    container: HTMLElement
  ): { startOffset: number; endOffset: number } | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return null;
    }

    const range = selection.getRangeAt(0);
    if (!container.contains(range.commonAncestorContainer)) {
      return null;
    }

    const preStart = document.createRange();
    preStart.selectNodeContents(container);
    preStart.setEnd(range.startContainer, range.startOffset);
    const startOffset = preStart.toString().length;
    const endOffset = startOffset + range.toString().length;

    return { startOffset, endOffset };
  }

  applyAnnotations(container: HTMLElement, annotations: IAnnotation[]): void {
    container.normalize();
    const sorted = [...annotations].sort((a, b) => a.startOffset - b.startOffset);
    for (const annotation of sorted) {
      this.applyOne(container, annotation);
    }
  }

  private applyOne(container: HTMLElement, annotation: IAnnotation): void {
    const range = this.rangeFromOffsets(
      container,
      annotation.startOffset,
      annotation.endOffset
    );
    if (!range) return;

    const mark = document.createElement('mark');
    mark.dataset['annotationId'] = annotation.id;
    mark.dataset['note'] = annotation.note;
    mark.style.setProperty('--annotation-color', annotation.color);
    mark.className = 'annotation-mark';

    try {
      range.surroundContents(mark);
    } catch {
      const fragment = range.extractContents();
      mark.appendChild(fragment);
      range.insertNode(mark);
    }
  }

  private rangeFromOffsets(
    container: HTMLElement,
    start: number,
    end: number
  ): Range | null {
    const textContent = container.textContent ?? '';
    if (start < 0 || end > textContent.length || start >= end) {
      return null;
    }

    const range = document.createRange();
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);

    let charCount = 0;
    let startSet = false;
    let node: Node | null;

    while ((node = walker.nextNode())) {
      const len = node.textContent?.length ?? 0;

      if (!startSet && charCount + len >= start) {
        range.setStart(node, start - charCount);
        startSet = true;
      }

      if (startSet && charCount + len >= end) {
        range.setEnd(node, end - charCount);
        return range;
      }

      charCount += len;
    }

    return null;
  }
}
