import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { AnalysisComponent } from './pages/analysis/analysis.component';
import { CaptureComponent } from './pages/capture/capture.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'catalog',
        component: CatalogComponent
    },
    {
        path: 'analysis',
        component: AnalysisComponent
    },
    {
        path: 'capture',
        component: CaptureComponent
    }
];
