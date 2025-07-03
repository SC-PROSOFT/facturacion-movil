import React, { useState, useEffect } from 'react';
import { Text, TextStyle } from 'react-native';

interface TypingTextProps {
  words: string[]; // Palabras que alternarán
  typingSpeed?: number; // Velocidad de escritura en ms
  pauseBetweenWords?: number; // Pausa entre palabras en ms
  style?: TextStyle; // Estilos personalizados para el texto
}

const TypingText: React.FC<TypingTextProps> = ({
  words,
  typingSpeed = 150, // Valor por defecto: 150ms
  pauseBetweenWords = 1000, // Valor por defecto: 1000ms
  style,
}) => {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    let typingInterval: NodeJS.Timeout | null = null;

    const typeWord = () => {
      const currentWord = words[currentWordIndex];
      if (isTyping) {
        // Escribir letra por letra
        if (text.length < currentWord.length) {
          setText(currentWord.slice(0, text.length + 1));
        } else {
          setTimeout(() => setIsTyping(false), pauseBetweenWords); // Pausa antes de borrar
        }
      } else {
        // Borrar letra por letra
        if (text.length > 0) {
          setText(currentWord.slice(0, text.length - 1));
        } else {
          setIsTyping(true); // Cambiar a modo de escritura
          setCurrentWordIndex((currentWordIndex + 1) % words.length); // Alternar palabra
        }
      }
    };

    typingInterval = setInterval(typeWord, typingSpeed);

    return () => {
      if (typingInterval) clearInterval(typingInterval);
    };
  }, [text, isTyping, currentWordIndex]);

  return (
    <Text allowFontScaling={false} style={style}>
      {text}
    </Text>
  );
};

export {TypingText};