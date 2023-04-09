import './main.scss'

import { render } from 'preact'
import { Router } from 'preact-router';

import EntityTypesProvider from './form/contexts/entity-types-provider';
import { useState } from 'preact/hooks';
import DashboardView from './views/dashboard-view';

window.viteIsLoaded = true;

const Main = () => {
  const [keyValues, setKeyValues] = useState(new URL(document.location).searchParams.getAll('keys'));

  return <EntityTypesProvider>
    <Router>
      <DashboardView path="/Admin" />
    </Router>
    {/* 
    <div class={"layout" + (expandedNavigationPanel ? ' expanded-navigation-panel' : showNavigationPanel ? ' show-navigation-panel' : '')}>
      <MainMenu />
      <Navbar />
      <Router>
        <NavigationPanel path="/Admin/List/:entityTypeName" mode="new" />
        <NavigationPanel path="/Admin/New/:entityTypeName" mode="new" />
        <NavigationPanel path="/Admin/Edit/:entityTypeName" mode="edit" />
        <NavigationPanel path="/Admin/Delete/:entityTypeName" />
      </Router>
      <Router onChange={() => setKeyValues(new URL(document.location).searchParams.getAll('keys'))}>
        <div className="layout-main-panel" path="/Admin/"><Dashboard /></div>
        <div className="layout-main-panel" path="/Admin/New/:entityTypeName"><Form key={'form-new'} mode="new" /></div>
        <div className="layout-main-panel" path="/Admin/Edit/:entityTypeName"><Form key={'form-edit'} mode="edit" keyValues={keyValues} /></div>
        <div className="layout-main-panel" path="/Admin/Delete/:entityTypeName"><Delete /></div>
      </Router>
    </div>
     */}
  </EntityTypesProvider>
};

render(<Main />, document.getElementById('app'));

document.addEventListener('keydown', event => {
  if (event.key != 'Enter') {
    return;
  }

  if (event.target.tagName == 'A' && !event.target.getAttribute('href') && event.target.getAttribute('tabindex') == '0') {
    event.target.click();
  }
});