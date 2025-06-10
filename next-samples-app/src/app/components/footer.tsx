import React from "react";
import { Text } from '@baseline-ui/core';

const Footer: React.FC = () => (
    <footer style={{
        width: '100%',
        padding: '1rem 0',
        background: '#f5f5f5',
        textAlign: 'center',
        fontSize: '0.9rem',
        color: '#555',
        borderTop: '1px solid #e0e0e0',
        position: 'fixed',
        bottom: 0,
        left: 0
    }}>
        <Text size="sm" type="subtitle">&copy; {new Date().getFullYear()} Nutrient</Text>
    </footer>
);

export default Footer;