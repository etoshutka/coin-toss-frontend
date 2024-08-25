import React, { useState } from 'react';
import styled from 'styled-components';

const CopyContainer = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  user-select: none;

  &:hover {
    background-color: #e0e0e0;
  }
`;

const AddressText = styled.span`
  margin-right: 8px;
  font-family: monospace;
`;

const CopyIcon = styled.span`
  font-size: 14px;
`;

interface CopyAddressProps {
  address: string;
}

export const CopyAddress: React.FC<CopyAddressProps> = ({ address }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <CopyContainer onClick={handleCopy}>
      <AddressText>{address}</AddressText>
      <CopyIcon>{copied ? '✓' : '📋'}</CopyIcon>
    </CopyContainer>
  );
};