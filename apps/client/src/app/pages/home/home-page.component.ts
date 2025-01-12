import {
  ChangeDetectorRef,
  Component,
  HostBinding,
  OnDestroy,
  OnInit
} from '@angular/core';
import { DataService } from '@ghostfolio/client/services/data.service';
import { UserService } from '@ghostfolio/client/services/user/user.service';
import { InfoItem, User } from '@ghostfolio/common/interfaces';
import { hasPermission, permissions } from '@ghostfolio/common/permissions';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'gf-home-page',
  styleUrls: ['./home-page.scss'],
  templateUrl: './home-page.html'
})
export class HomePageComponent implements OnDestroy, OnInit {
  @HostBinding('class.with-info-message') get getHasMessage() {
    return this.hasMessage;
  }

  public hasMessage: boolean;
  public hasPermissionToAccessFearAndGreedIndex: boolean;
  public info: InfoItem;
  public tabs: { iconName: string; label: string; path: string }[] = [];
  public user: User;

  private unsubscribeSubject = new Subject<void>();

  public constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private dataService: DataService,
    private userService: UserService
  ) {
    this.info = this.dataService.fetchInfo();

    this.userService.stateChanged
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe((state) => {
        if (state?.user) {
          this.tabs = [
            {
              iconName: 'analytics-outline',
              label: $localize`Overview`,
              path: 'overview'
            },
            {
              iconName: 'wallet-outline',
              label: $localize`Holdings`,
              path: 'holdings'
            },
            {
              iconName: 'reader-outline',
              label: $localize`Summary`,
              path: 'summary'
            }
          ];
          this.user = state.user;

          this.hasMessage =
            hasPermission(
              this.user?.permissions,
              permissions.createUserAccount
            ) || !!this.info.systemMessage;

          this.hasPermissionToAccessFearAndGreedIndex = hasPermission(
            this.info?.globalPermissions,
            permissions.enableFearAndGreedIndex
          );

          if (this.hasPermissionToAccessFearAndGreedIndex) {
            this.tabs.push({
              iconName: 'newspaper-outline',
              label: $localize`Markets`,
              path: 'market'
            });
          }

          this.changeDetectorRef.markForCheck();
        }
      });
  }

  public ngOnInit() {}

  public ngOnDestroy() {
    this.unsubscribeSubject.next();
    this.unsubscribeSubject.complete();
  }
}
