import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('ardf-console');

  private router = inject(Router);
  private routerEventsSub?: Subscription;

  isScoreboardPage = signal(false);
  showToolbar = signal(true);
  private mouseMoveHandler?: (event: MouseEvent) => void;

  ngOnInit() {
    this.routerEventsSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = (event as NavigationEnd).urlAfterRedirects || (event as NavigationEnd).url;
        const onScoreboard = url.startsWith('/scoreboard');
        this.isScoreboardPage.set(onScoreboard);
        if (onScoreboard) {
          this.enableScoreboardToolbarBehavior();
        } else {
          this.disableScoreboardToolbarBehavior();
        }
      });
  }

  ngOnDestroy() {
    if (this.routerEventsSub) {
      this.routerEventsSub.unsubscribe();
    }
    this.removeMouseMoveListener();
  }

  private enableScoreboardToolbarBehavior() {
    this.showToolbar.set(false);
    this.addMouseMoveListener();
  }

  private disableScoreboardToolbarBehavior() {
    this.showToolbar.set(true);
    this.removeMouseMoveListener();
  }

  private addMouseMoveListener() {
    if (this.mouseMoveHandler) {
      return;
    }
    this.mouseMoveHandler = (event: MouseEvent) => {
      const atTop = event.clientY <= 80;
      this.showToolbar.set(atTop);
    };
    window.addEventListener('mousemove', this.mouseMoveHandler);
  }

  private removeMouseMoveListener() {
    if (this.mouseMoveHandler) {
      window.removeEventListener('mousemove', this.mouseMoveHandler);
      this.mouseMoveHandler = undefined;
    }
  }
}
