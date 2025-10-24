import { Text } from 'react-native';
import {useFonts} from 'expo-font';

const [loaded, error] = useFonts({
    'DM-Sans': require('../assets/font/DM_Sans/static/DMSans-Regular.ttf'),
    'DM-Sans-Bold': require('../assets/font/DM_Sans/static/DMSans-Bold.ttf'),
    'DM-Sans-Italic': require('../assets/font/DM_Sans/static/DMSans-Italic.ttf'),
});

const ProductText = ({children}: {children: React.ReactNode}) => {

    return (
        <Text style={{ fontFamily: 'DM-Sans', textAlign: 'left', textTransform: 'capitalize' }}>{children}</Text>
    );
};

const ProductHeader = ({children}: {children: React.ReactNode}) => {
    return (
        <Text style={{ fontFamily: 'DM-Sans-Bold', textAlign: 'left', textTransform: 'capitalize' }}>{children}</Text>
    );
};

export { ProductText, ProductHeader };
