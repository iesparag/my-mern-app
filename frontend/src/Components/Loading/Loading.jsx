import React from 'react';
import { Center, Spinner } from '@chakra-ui/react';

const Loading = ({ size = "xl", color = "blue.500", bgColor = "rgba(255, 255, 255, 0.8)" }) => {
  return (
    <Center h="100vh" w="100vw" position="absolute" top="0" left="0" bg={bgColor} zIndex="1000">
      <Spinner size={size} color={color} />
    </Center>
  );
};

export default Loading;
