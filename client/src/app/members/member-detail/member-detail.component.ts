import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { Member } from 'src/app/_models/member';
import { MemberService } from 'src/app/_services/member.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {
  member: Member | undefined;
  galleryOptions: NgxGalleryOptions[] = [];
  galleryImages: NgxGalleryImage[] = [];

  constructor(private memberService: MemberService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.loadMember();

    this.galleryOptions = [
      {
        width: '400px',
        height: '400px',
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false
      }
    ];
  }

  getImages(): NgxGalleryImage[] {
    if (this.member) {
      const imageUrls = [];

      for (const photo of this.member.photos) {
        imageUrls.push({
          small: photo.url,
          medium: photo.url,
          big: photo.url
        });
      }

      return imageUrls;
    }

    return [];
  }

  loadMember(): void {
    const username = this.route.snapshot.paramMap.get('username');

    if (username) {
      this.memberService.getMember(username).subscribe({
        next: member => {
          this.member = member;
          this.galleryImages = this.getImages();
        }
      });
    }
  }
}
