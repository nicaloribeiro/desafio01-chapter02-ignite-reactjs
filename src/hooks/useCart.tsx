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
      if (!await verificaEstoque(data.id)) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }
      let newProducts: Array<Product> = []
      if (cart.some(el => el.id === data.id)) {
        newProducts = cart.map(product =>
          product.id === data.id ? {
            ...product,
            amount: product.amount + 1
          } : { ...product }
        )
      } else newProducts = [...cart, { ...data, amount: 1 }]
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newProducts))
      setCart(newProducts)

    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const newProducts = cart.filter(product => product.id != productId)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newProducts))
      setCart(newProducts)

    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const { data } = await api.get(`/stock/${productId}`)
      if (data.amount < amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }
      let newProducts: Array<Product> = []
      newProducts = cart.map(product =>
        product.id === productId ? {
          ...product,
          amount: amount
        } : { ...product }
      )
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newProducts))
      setCart(newProducts)
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
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
