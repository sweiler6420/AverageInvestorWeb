import React from 'react';

export default function Research() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-gothic font-xl mb-6">Research</h1>
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6">
                <h2 className="text-2xl font-gothic font-medium mb-4 text-neutral-900 dark:text-neutral-200">
                    Research Dashboard
                </h2>
                <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                    This is the Research route. You can add your research tools and features here.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                        <h3 className="font-gothic font-medium text-lg mb-2 text-neutral-900 dark:text-neutral-200">
                            Stock Analysis
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            Analyze stocks and market trends
                        </p>
                    </div>
                    <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                        <h3 className="font-gothic font-medium text-lg mb-2 text-neutral-900 dark:text-neutral-200">
                            Market Research
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            Research market conditions and opportunities
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
