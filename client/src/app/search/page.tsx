import type { Metadata } from 'next'
import ClientSearch from './components/client.search';

export const metadata: Metadata = {
    title: 'Search your tracks',
    description: 'miêu tả',
}

const SearchPage = () => {
    return (
        <div>
            <ClientSearch />
        </div>
    )
}

export default SearchPage;