import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { ScoreboardPage } from './pages/scoreboard-page/scoreboard-page';
import { PlayersPage } from './pages/players-page/players-page';
import { SystemPage } from './pages/system-page/system-page';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
    {
        path: 'dashboard',
        component: DashboardPage,
    },
    {
        path: 'scoreboard',
        component: ScoreboardPage,
    },
    {
        path: 'players',
        component: PlayersPage,
    },
    {
        path: 'system',
        component: SystemPage,
    }
];
