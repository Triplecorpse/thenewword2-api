import * as simpleNodeLogger from 'simple-node-logger';

(() => {
    const logger = simpleNodeLogger.createSimpleLogger({
        logFilePath: '../logs.log',
        timestampFormat: 'YYYY-MM-DDTHH:mm:ssZ'
    });

    const log = console.log;
    console.log = (...args: any[]) => {
        log(...args);
        logger.log('info', args);
    };

    const warn = console.warn;
    console.warn = (...args: any[]) => {
        warn(...args);
        logger.warn('warn', args);
    };

    const error = console.error;
    console.error = (...args: any[]) => {
        error(...args);
        logger.error('error', args);
    };

    const debug = console.warn;
    console.debug = (...args: any[]) => {
        debug(...args);
        logger.debug('debug', args);
    };
})();

