import { Component, Input, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { take } from 'rxjs';
import { Member } from 'src/app/_models/member';
import { Photo } from 'src/app/_models/photo';
import { User } from 'src/app/_models/user';
import { AccountService } from 'src/app/_services/account.service';
import { MemberService } from 'src/app/_services/member.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
  @Input() member: Member | undefined;
  uploader: FileUploader | undefined;
  hasBaseDropZoneOver = false;
  baseUrl = environment.apiUrl;
  user: User | undefined;

  constructor(private accountService: AccountService, private memberService: MemberService) { 
    accountService.currentUser$.pipe(take(1)).subscribe(
      {
        next: user => {
          if (user) this.user = user;
        }
      }
    );
  }

  ngOnInit(): void {
    this.initializeUploader();
  }

  fileOverBase(e: any) {
    this.hasBaseDropZoneOver = e;
  }

  setMainPhoto(photo: Photo): void {
    this.memberService.setMainPhoto(photo.id).subscribe(
      {
        next: () => {
          if (this.member && this.user) {
            this.user.photoUrl = photo.url;
            this.accountService.setCurrentUser(this.user);

            this.member.mainPhotoUrl = photo.url;
            this.member.photos.forEach(p => {
              if (p.isMain) p.isMain = false;
              if (p.id == photo.id) p.isMain = true;
            })
          }
        }
      }
    );
  }

  deletePhoto(photoId: number): void {
    this.memberService.deletePhoto(photoId).subscribe(
      {
        next: () => {
          if (this.member) {
            this.member.photos = this.member.photos.filter(x => x.id !== photoId);

          }
        }
      }
    );
  }

  initializeUploader(): void {
    this.uploader = new FileUploader(
      {
        url: this.baseUrl + '/users/add-photo',
        authToken: 'Bearer ' + this.user?.token,
        isHTML5: true,
        allowedFileType: ['image'],
        removeAfterUpload: true,
        autoUpload: false,
        maxFileSize: 10 * 1024 * 1024
      }
    );

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    }

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if (response) {
        const photo = JSON.parse(response);
        this.member?.photos.push(photo);

        if (photo.isMain && this.member && this.user) {
          this.member.mainPhotoUrl = photo.url;
          this.user.photoUrl = photo.url;
          this.accountService.setCurrentUser(this.user);
        }
      }
    }
  }
}
