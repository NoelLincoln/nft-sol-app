import { PhantomProvider } from '../types';

/**
 * Signs a message
 * @param   {PhantomProvider} provider a Phantom Provider
 * @param   {String}          message  a message to sign
 * @returns {Any}                      TODO(get type)
 */
const signMessage = async (provider: PhantomProvider, message: string): Promise<string> => {
  try {
    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await provider.signMessage(encodedMessage);
    return signedMessage;
  } catch (error) {
    console.warn(error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unknown error occurred');
  }
};

export default signMessage;