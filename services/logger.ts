import * as simpleNodeLogger from 'simple-node-logger';

(() => {
    const logger = simpleNodeLogger.createSimpleLogger({
        logFilePath: '../logs.log',
        timestampFormat: 'YYYY-MM-DDTHH:mm:ssZ'
    });

    console.log = (...args: any[]) => {
        logger.log('info', args);
    };

    console.warn = (...args: any[]) => {
        logger.warn('warn', args);
    };

    console.error = (...args: any[]) => {
        logger.error('error', args);
    };

    console.debug = (...args: any[]) => {
        logger.debug('debug', args);
    };
})();

