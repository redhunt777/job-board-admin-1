import Image from 'next/image';
import { FC } from 'react';

const LogoHeader: FC = () => {
    return (
        <header className="bg-white w-full py-6 shadow-sm">
            <div className="flex justify-start md:justify-start items-center w-full max-w-6xl mx-auto px-4 md:px-8">
                <Image 
                    src="/wordmark-blue.svg" 
                    alt="Recrivio Logo" 
                    width={200}
                    height={80}
                    className="mx-auto md:mx-0"
                    priority
                    draggable={false}
                />
            </div>
        </header>
    );
}

export default LogoHeader;