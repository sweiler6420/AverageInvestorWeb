import {Outlet} from 'react-router-dom'

import Header from './header/Header';

export default function Layout() {

  return (
    <main className="App" style={{'width':'100%', 'height':'100%'}}>
        <Header/>
        <Outlet />
    </main>
  );
}
