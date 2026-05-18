import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { notification } from 'antd';
import { store } from './store';
import { router } from './router/router';

notification.config({
  placement: 'topRight',
  top: 60,
  duration: 3,
  rtl: false,
});

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;
