import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface IAnnotationSaveEvent {
  color: string;
  note: string;
}

const PRESET_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

@Component({
  selector: 'app-annotation-toolbar',
  imports: [FormsModule],
  templateUrl: './annotation-toolbar.component.html',
  styleUrl: './annotation-toolbar.component.scss',
})
export class AnnotationToolbarComponent {
  readonly visible = input(false);
  readonly position = input({ x: 0, y: 0 });

  readonly annotationSave = output<IAnnotationSaveEvent>();
  readonly annotationCancel = output<void>();

  protected readonly colors = PRESET_COLORS;
  protected readonly selectedColor = signal(PRESET_COLORS[4]);
  protected noteText = '';

  protected onSave(): void {
    this.annotationSave.emit({ color: this.selectedColor(), note: this.noteText });
    this.reset();
  }

  protected onCancel(): void {
    this.annotationCancel.emit();
    this.reset();
  }

  private reset(): void {
    this.noteText = '';
    this.selectedColor.set(PRESET_COLORS[4]);
  }
}
