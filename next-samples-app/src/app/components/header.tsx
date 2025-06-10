import { Text } from '@baseline-ui/core';
import React from 'react';

const Header: React.FC = () => (
    <header style={{width: '100%', padding: '1rem',background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        <Text type='title' size='lg'>Awesome Nutrient</Text>
    </header>
);

export default Header;