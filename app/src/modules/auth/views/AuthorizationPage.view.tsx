/** @jsxImportSource hono/jsx */

import { BaseLayout } from '../../../ui/layouts/BaseLayout.tsx';
import { AuthPageEnum } from './types.ts';
import { LoginCard } from './LoginCard.view.tsx';
import { RegisterCard } from './RegisterCard.view.tsx';

const AUTH_BODY_CLASS = 'flex items-center justify-center p-4';

interface IAuthPageProps {
  authPageType: AuthPageEnum;
}

export const AuthorizationPage = ({ authPageType }: IAuthPageProps) => {
  let pageToRender = null;
  let pageTitle = '';
  switch (authPageType) {
    case AuthPageEnum.login:
      pageToRender = <LoginCard />;
      pageTitle = 'Login';
      break;
    case AuthPageEnum.register:
      pageToRender = <RegisterCard />;
      pageTitle = 'Register';
      break;
    default:
      break;
  }
  return (
    <BaseLayout title={pageTitle} bodyClass={AUTH_BODY_CLASS}>
      <div id='auth-card' class='earthbound-card p-8 w-full max-w-md'>
        <div id='form-error-message'></div>
        <h1 id='pageTitle' class='text-3xl mb-6 text-[#2D2A26]'>
          {pageTitle}
        </h1>
        {pageToRender}
      </div>
    </BaseLayout>
  );
};
