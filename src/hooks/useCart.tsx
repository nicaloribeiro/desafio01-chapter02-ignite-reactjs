import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });


  async function verificaEstoque(productId: number) {
    const { data } = await api.get(`/stock/${productId}`)
    const product = cart.find(product => product.id == productId)
    return (!product || data.amount > product.amount) ? true : false
  } 

  const addProduct = async (productId: number) => {
    try {
      const { data } = await api.get(`/products/${productId}`)
      if(!await verificaEstoque(data.id)) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }      
      let newPorducts: Array<Product> = []
      if(cart.some(el => el.id === data.id)){
      newPorducts = cart.map(product =>
        product.id === data.id ? {
          ...product,
          amount: product.amount + 1
        } : { ...product }
      )
      } else newPorducts = [...cart, {...data, amount: 1}]
      setCart(newPorducts)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newPorducts))

    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
