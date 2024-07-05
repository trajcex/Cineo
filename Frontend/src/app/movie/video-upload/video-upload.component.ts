import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-video-upload',
  templateUrl: './video-upload.component.html',
  styleUrls: ['./video-upload.component.css']
})
export class VideoUploadComponent {
  files: File[] = [];
  videoPreviews: any[] = [];
  @Output() videoBase64String = new EventEmitter<string>();

  constructor() {}

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.files.push(...event.target.files);
      this.previewVideos();
      // Call conversion function for the last added file
      this.convertFileToBase64(this.files[this.files.length - 1]);
    }
  }

  previewVideos() {
    this.videoPreviews = [];
    for (let i = 0; i < this.files.length; i++) {
      const file = this.files[i];
      const reader = new FileReader();
      reader.onload = () => {
        this.videoPreviews.push(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  deleteVideo(index: number) {
    this.files.splice(index, 1);
    this.videoPreviews.splice(index, 1);
  }

  private convertFileToBase64(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      let base64String = reader.result as string;
      base64String = base64String.split(',')[1];
      // Emit the Base64 string to the parent component
      this.videoBase64String.emit(base64String);
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };

    reader.readAsDataURL(file);
  }
}
