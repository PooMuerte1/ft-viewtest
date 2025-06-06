import React from 'react';
import Header from '../../components/layout/Header/Header';
import TokenList from '../../components/common/TokenList/TokenList';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col">
      <Header />
      <div className="h-full bg-black py-8 flex-1">
        <TokenList />
      </div>
    </div>
  );
};

export default Home; 