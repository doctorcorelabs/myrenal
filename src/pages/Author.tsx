import React from 'react';

const AuthorPage: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <iframe
        src="https://daivanlabs.com/"
        title="Author Portfolio"
        className="flex-grow border-0 w-full h-[calc(100vh-4rem)]" // Use flex-grow, border-0, full width, and calculated height (4rem = 64px)
        // Removed inline style
      />
    </div>
  );
};

export default AuthorPage;
