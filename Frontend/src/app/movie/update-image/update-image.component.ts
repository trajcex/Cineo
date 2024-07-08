import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { NgxDropzoneChangeEvent } from 'ngx-dropzone';
import { ActivatedRoute } from '@angular/router';
import { LambdaService } from '../../service/lambda.service';

@Component({
  selector: 'app-update-image',
  templateUrl: './update-image.component.html',
  styleUrls: ['./update-image.component.css']
})
export class UpdateImageComponent implements OnInit {
  @Output() imageBase64String = new EventEmitter<string>();

  files: File[] = [];
  imagePreviews: string[] = [];
  maxNumberOfPictures: boolean = false;
  thumbnailUrl: string = "";

  constructor(
    private route: ActivatedRoute,
    private lambdaService: LambdaService
  ) {}

  id: string = "";
  fileName: string = "";

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
        this.id = params['id'];
        this.fileName = params['fileName'];
        console.log(this.id, this.fileName);
        this.fetchThumbnail(this.id, this.fileName);
      }
    );
  }

  fetchThumbnail(id: string, fileName: string) {
    this.lambdaService.getThumbnailUrl(id, fileName).subscribe({
      next: (response) => {
        this.thumbnailUrl = response.thumbnailUrl;
      },
      error: (error) => {
        console.error('Error fetching thumbnail URL', error);
      },
      complete: () => {
        console.log('Thumbnail fetch completed');
        console.log(this.thumbnailUrl);
      }
    });
  }

  onDrop(event: NgxDropzoneChangeEvent): void {
    if (event.addedFiles && event.addedFiles.length > 0) {
      if (this.files.length > 0 || this.thumbnailUrl) {
        this.deleteImage(0);
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
    this.thumbnailUrl = "";
    this.imageBase64String.emit('');
  }

  base64ToUint8Array(base64String: string): Uint8Array {
    const binaryString = atob(base64String);
    const length = binaryString.length;
    const uint8Array = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }

    return uint8Array;
  }

  createFileFromBase64(base64String: string, fileName: string, fileType: string): File {
    const uint8Array = this.base64ToUint8Array(base64String);
    const blob = new Blob([uint8Array], { type: fileType });
    return new File([blob], fileName, { type: fileType });
  }
}
