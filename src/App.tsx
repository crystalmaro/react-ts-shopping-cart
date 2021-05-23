import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
// Components
import Item from './Item/Item';
import Cart from './Cart/Cart';
import Drawer from '@material-ui/core/Drawer';
import LinearProgress from '@material-ui/core/LinearProgress';
import Grid from '@material-ui/core/Grid';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import Badge from '@material-ui/core/Badge';
// Styles
import { Wrapper, StyledButton } from './App.styles';
// Types
export type CartItemType = {
  id: number;
  category: string;
  description: String;
  image: string;
  price: number;
  title: string;
  amount: number;
  // if amount isn't returned from fetch, why isn't amount option?
}

// 1. first await is when convert to JSON
// converting to JSON is also an async action
// 2. second (await) is for the api itself
const getProducts = async (): Promise<CartItemType[]> => { 
  const result = await (await fetch('https://fakestoreapi.com/products')).json();
  return result;
}


const App = () => {
  // const [cartOpen, setCartOpen] = useState(false as boolean);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  // const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [cartItems, setCartItems] = useState([] as CartItemType[]);
  // const { data, isLoading, error } = useQuery<CartItemType[]>(
  //   'products', // query key for caching
  //   getProducts // function that the query will use to request data
  // );
  // console.log(data);
  const [data, setData] = useState([] as CartItemType[]);
  const [loading, setLoading] = useState(false as boolean)

  useEffect(() => {
    getData();
  }, [])
  const getData = async () => {
    setLoading(true)
    const result = await getProducts()
    setData(result)
    setLoading(false)
  }

  const getTotalItems = (items: CartItemType[]) => {
    return items.reduce((acc: number, item) => acc + item.amount, 0);
  };

  const handleAddToCart = (clickedItem: CartItemType) => {
    setCartItems(prev => {
      // 1. is the item already added in the cart?
      const isItemInCart = prev.find(item => item.id === clickedItem.id);
      
      if (isItemInCart) {
        return prev.map(item => (
          item.id === clickedItem.id
            ? { ...item, amount: item.amount + 1 }
            : item
        ))
      }
      // first time the item is added
      return [...prev, { ...clickedItem, amount: 1 }];
    })
  };

  const handleRemoveFromCart = (id: number) => {
    setCartItems(prev => (
      prev.reduce((acc, item) => {
        if (item.id === id) {
          // if item.id is equal to the id from arg, then it's the item that's clicked on
          if (item.amount === 1) {
            // skip the item, and it'll delete the item from array
            return acc;
          }
          // otherwise, return a new array, and subtract 1 from the item.amount
          return [...acc, { ...item, amount: item.amount - 1}];
        } else {
          return [...acc, item];
        }
      // the acc starts with an empty array, and specify it as the cart item type
      },[] as CartItemType[])
    ))
  };

  if (loading) return <LinearProgress />;
  // if (isLoading) return <LinearProgress />;
  // if (error) return <div>Something went wrong...</div>

  return (
    <Wrapper>
      <Drawer anchor='right' open={cartOpen} onClose={() => setCartOpen(false)}>
        <Cart
          cartItems={cartItems}
          addToCart={handleAddToCart}
          removeFromCart={handleRemoveFromCart}
        />
      </Drawer>
      <StyledButton onClick={() => setCartOpen(true)}>
        <Badge badgeContent={getTotalItems(cartItems)} color='error'>
          <AddShoppingCartIcon />
        </Badge>
      </StyledButton>
      <Grid container spacing={3}>
        {data?.map(item => (
          // add ? after data, otherwise it'll throw error if it's undefined
          <Grid item key={item.id} xs={12} sm={4}>
            <Item item={item} handleAddToCart={handleAddToCart} />
          </Grid>
        ))}
      </Grid>
    </Wrapper>
  );
}

export default App;
