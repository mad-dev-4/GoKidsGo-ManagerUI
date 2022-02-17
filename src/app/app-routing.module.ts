import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'venue/:id',
    loadChildren: () => import('./pages/venue/venue.module').then( m => m.VenuePageModule)
  },
  {
    path: 'venue-list',
    loadChildren: () => import('./pages/venue-list/venue-list.module').then( m => m.VenueListPageModule)
  },
  {
    path: 'location/:id',
    loadChildren: () => import('./pages/location/location.module').then( m => m.LocationPageModule)
  },
  {
    path: 'location-list',
    loadChildren: () => import('./pages/location-list/location-list.module').then( m => m.LocationListPageModule)
  },
  {
    path: 'tag-list',
    loadChildren: () => import('./pages/tag-list/tag-list.module').then( m => m.TagListPageModule)
  },
  {
    path: 'workflow/:id',
    loadChildren: () => import('./pages/workflow/workflow.module').then( m => m.WorkflowPageModule)
  },
  {
    path: 'workflow-event',
    loadChildren: () => import('./pages/workflow-event/workflow-event.module').then( m => m.WorkflowEventPageModule)
  },
  {
    path: 'alert-list',
    loadChildren: () => import('./pages/alert-list/alert-list.module').then( m => m.AlertListPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'location-search',
    loadChildren: () => import('./pages/location-search/location-search.module').then( m => m.LocationSearchPageModule)
  },
  {
    path: 'venue-search',
    loadChildren: () => import('./pages/venue-search/venue-search.module').then( m => m.VenueSearchPageModule)
  },
  {
    path: 'find-location-modal',
    loadChildren: () => import('./pages/find-location-modal/find-location-modal.module').then( m => m.FindLocationModalPageModule)
  },
  {
    path: 'find-tag-modal',
    loadChildren: () => import('./pages/find-tag-modal/find-tag-modal.module').then( m => m.FindTagModalPageModule)
  },
  {
    path: 'find-amenity-modal',
    loadChildren: () => import('./pages/find-amenity-modal/find-amenity-modal.module').then( m => m.FindAmenityModalPageModule)
  },
  {
    path: 'new-amenity-modal',
    loadChildren: () => import('./pages/new-amenity-modal/new-amenity-modal.module').then( m => m.NewAmenityModalPageModule)
  },
  {
    path: 'new-tag-modal',
    loadChildren: () => import('./pages/new-tag-modal/new-tag-modal.module').then( m => m.NewTagModalPageModule)
  },
  {
    path: 'tag-search',
    loadChildren: () => import('./pages/tag-search/tag-search.module').then( m => m.TagSearchPageModule)
  },
  {
    path: 'workflow-list/:status',
    loadChildren: () => import('./pages/workflow-list/workflow-list.module').then( m => m.WorkflowListPageModule)
  },
  {
    path: 'jobs-list',
    loadChildren: () => import('./pages/jobs-list/jobs-list.module').then( m => m.JobsListPageModule)
  },
  {
    path: 'job-logs-list/:id',
    loadChildren: () => import('./pages/job-logs-list/job-logs-list.module').then( m => m.JobLogsListPageModule)
  },
  {
    path: 'alert-search',
    loadChildren: () => import('./pages/alert-search/alert-search.module').then( m => m.AlertSearchPageModule)
  },
  {
    path: 'postal-list',
    loadChildren: () => import('./pages/postal-list/postal-list.module').then( m => m.PostalListPageModule)
  },
  {
    path: 'postal-search',
    loadChildren: () => import('./pages/postal-search/postal-search.module').then( m => m.PostalSearchPageModule)
  },
  {
    path: 'image-management',
    loadChildren: () => import('./pages/image-management/image-management.module').then( m => m.ImageManagementPageModule)
  },
  {
    path: 'postal/:id',
    loadChildren: () => import('./pages/postal/postal.module').then( m => m.PostalPageModule)
  },
  {
    path: 'category-list',
    loadChildren: () => import('./pages/category-list/category-list.module').then( m => m.CategoryListPageModule)
  },
  {
    path: 'find-category-modal',
    loadChildren: () => import('./pages/find-category-modal/find-category-modal.module').then( m => m.FindCategoryModalPageModule)
  },
  {
    path: 'new-workflow-modal',
    loadChildren: () => import('./pages/new-workflow-modal/new-workflow-modal.module').then( m => m.NewWorkflowModalPageModule)
  },
  {
    path: 'browse-venues',
    loadChildren: () => import('./pages/browse-venues/browse-venues.module').then( m => m.BrowseVenuesPageModule)
  },
  {
    path: 'user-search',
    loadChildren: () => import('./pages/user-search/user-search.module').then( m => m.UserSearchPageModule)
  },
  {
    path: 'user-list',
    loadChildren: () => import('./pages/user-list/user-list.module').then( m => m.UserListPageModule)
  },
  {
    path: 'job',
    loadChildren: () => import('./pages/job/job.module').then( m => m.JobPageModule)
  },
  {
    path: 'find-seasonal-tag-modal',
    loadChildren: () => import('./pages/find-seasonal-tag-modal/find-seasonal-tag-modal.module').then( m => m.FindSeasonalTagModalPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
