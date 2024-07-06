import { Component, EventEmitter, Output } from '@angular/core';
import { NgxDropzoneChangeEvent } from 'ngx-dropzone';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent {
  @Output() imageBase64String = new EventEmitter<string>();
  files: File[] = [];
  imagePreviews: string[] = [];

  onDrop(event: NgxDropzoneChangeEvent): void {
    if (event.addedFiles && event.addedFiles.length > 0) {
      if (this.files.length > 0) {
        this.deleteImage(0); // Remove the existing file if there's any
      }
      const file = event.addedFiles[0];
      this.files.push(file);
      this.generateImagePreview(file);
      this.convertFileToBase64(file);
    }
  }

  private generateImagePreview(file: File): void {
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (event.target && event.target.result) {
        this.imagePreviews[0] = event.target.result as string;
      }
    };

    reader.readAsDataURL(file);
  }

  private convertFileToBase64(file: File): void {
    const reader = new FileReader();

    reader.onload = () => {
      let base64String = reader.result as string;
      base64String = base64String.split(',')[1];
      this.imageBase64String.emit(base64String);
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };

    reader.readAsDataURL(file);
  }

  deleteImage(index: number): void {
    this.files.splice(index, 1);
    this.imagePreviews.splice(index, 1);
    this.imageBase64String.emit('');
  }
}
