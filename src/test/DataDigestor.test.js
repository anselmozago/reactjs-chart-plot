import DataDigestor from '../controller/DataDigestor';

describe('on digesting data', () => {

    it('should throw empty data error', async () => {
        var digestor = new DataDigestor('');
        var result = 'Empty input data.';
        await expect(digestor.digest()).rejects.toEqual(result);
    });

    it('should throw invalid data error', async () => {
        var data = `{type: 'start', timestamp: 1519862400000, select: ['response'], group: ['os']}
                    1519862400000
                    {type: 'data', timestamp: 1519862400000, os: 'linux', response: 0.1}
                    {type: 'stop', timestamp: 1519862460000}`;
        var result = 'Line 2: Invalid date for timestamp.';
        var digestor = new DataDigestor(data);
        await expect(digestor.digest()).rejects.toEqual(result);
    });

    it('should throw invalid timestamp error', async () => {
        var data = `{type: 'start', timestamp: 1519862400000, select: ['response'], group: ['os']}
                    {type: 'span', timestamp: 1519862400000, begin: 1519862400000, end: 1519862700000}
                    {type: 'data', timestamp: 'x', os: 'linux', response: 0.1}
                    {type: 'stop', timestamp: 1519862460000}`;
        var result = 'Line 3: Invalid date for timestamp.';
        var digestor = new DataDigestor(data);
        await expect(digestor.digest()).rejects.toEqual(result);
    });

    it('should throw invalid fields type start error', async () => {
        var data = `{type: 'start', timestamp: 1519862400000}
                    {type: 'span', timestamp: 1519862400000, begin: 1519862400000, end: 1519862700000}
                    {type: 'data', timestamp: 1519862400000, os: 'linux', response: 0.1}
                    {type: 'stop', timestamp: 1519862460000}`;
        var result = 'Line 1: Invalid parameters for the type \"start\"';
        var digestor = new DataDigestor(data);
        await expect(digestor.digest()).rejects.toEqual(result);
    });

    it('should throw invalid fields type span error', async () => {
        var data = `{type: 'start', timestamp: 1519862400000, select: ['response'], group: ['os']}
                    {type: 'span', timestamp: 1519862400000}
                    {type: 'data', timestamp: 1519862400000, os: 'linux', response: 0.1}
                    {type: 'stop', timestamp: 1519862460000}`;
        var result = 'Line 2: Invalid parameters for the type \"span\"';
        var digestor = new DataDigestor(data);
        await expect(digestor.digest()).rejects.toEqual(result);
    });

    it('should throw invalid fields type span timestamp error', async () => {
        var data = `{type: 'start', timestamp: 1519862400000, select: ['response'], group: ['os']}
                    {type: 'span', timestamp: 1519862400000, begin: 'x', end: 'y'}
                    {type: 'data', timestamp: 1519862400000, os: 'linux', response: 0.1}
                    {type: 'stop', timestamp: 1519862460000}`;
        var result = 'Line 2: Invalid date for timestamp.';
        var digestor = new DataDigestor(data);
        await expect(digestor.digest()).rejects.toEqual(result);
    });

    it('should throw invalid group fields type data error', async () => {
        var data = `{type: 'start', timestamp: 1519862400000, select: ['response'], group: ['os']}
                    {type: 'span', timestamp: 1519862400000, begin: 1519862400000, end: 1519862700000}
                    {type: 'data', timestamp: 1519862400000, response: 0.1}
                    {type: 'stop', timestamp: 1519862460000}`;
        var result = 'Line 3: Invalid group fields.';
        var digestor = new DataDigestor(data);
        await expect(digestor.digest()).rejects.toEqual(result);
    });

    it('should throw invalid select fields type data error', async () => {
        var data = `{type: 'start', timestamp: 1519862400000, select: ['response'], group: ['os']}
                    {type: 'span', timestamp: 1519862400000, begin: 1519862400000, end: 1519862700000}
                    {type: 'data', timestamp: 1519862400000, os: 'linux'}
                    {type: 'stop', timestamp: 1519862460000}`;
        var result = 'Line 3: Invalid select fields.';
        var digestor = new DataDigestor(data);
        await expect(digestor.digest()).rejects.toEqual(result);
    });

    it('should throw invalid type error', async () => {
        var data = `{type: 'other', timestamp: 1519862400000, os: 'linux', response: 0.1}`;
        var result = 'Line 1: Invalid type.';
        var digestor = new DataDigestor(data);
        await expect(digestor.digest()).rejects.toEqual(result);
    });

    it('should throw start event reported error', async () => {
        var data = `{type: 'span', timestamp: 1519862400000, begin: 1519862400000, end: 1519862700000}
                    {type: 'data', timestamp: 1519862400000, os: 'linux', response: 0.1}
                    {type: 'stop', timestamp: 1519862460000}`;
        var result = 'Start event was not reported.';
        var digestor = new DataDigestor(data);
        await expect(digestor.digest()).rejects.toEqual(result);
    });

    it('should throw span event reported error', async () => {
        var data = `{type: 'start', timestamp: 1519862400000, select: ['response'], group: ['os']}
                    {type: 'data', timestamp: 1519862400000, os: 'linux', response: 0.1}
                    {type: 'stop', timestamp: 1519862460000}`;
        var result = 'Span event was not reported.';
        var digestor = new DataDigestor(data);
        await expect(digestor.digest()).rejects.toEqual(result);
    });

    it('should throw data event reported error', async () => {
        var data = `{type: 'start', timestamp: 1519862400000, select: ['response'], group: ['os']}
                    {type: 'span', timestamp: 1519862400000, begin: 1519862400000, end: 1519862700000}
                    {type: 'stop', timestamp: 1519862460000}`;
        var result = 'Data event was not reported.';
        var digestor = new DataDigestor(data);
        await expect(digestor.digest()).rejects.toEqual(result);
    });

    it('should return the result in an array', async () => {
        var data = `{type: 'start', timestamp: 1519862400000, select: ['response'], group: ['os']}
                    {type: 'span', timestamp: 1519862400000, begin: 1519862400000, end: 1519862700000}
                    {type: 'data', timestamp: 1519862400000, os: 'linux', response: 0.1}
                    {type: 'stop', timestamp: 1519862460000}`;
        var result = [["Time", "Linux Response"], ["00:00", 0.1]];
        var digestor = new DataDigestor(data);
        await expect(digestor.digest()).resolves.toEqual(result);
    });

    it('should return the result in an array', async () => {
        var data = `{type: 'start', timestamp: 1519862400000, select: ['min_response_time', 'max_response_time'], group: ['os', 'browser']}
                    {type: 'span', timestamp: 1519862400000, begin: 1519862400000, end: 1519862700000}
                    {type: 'data', timestamp: 1519862400000, os: 'linux', browser: 'chrome', min_response_time: 0.1, max_response_time: 1.3}
                    {type: 'data', timestamp: 1519862400000, os: 'mac', browser: 'chrome', min_response_time: 0.2, max_response_time: 1.2}
                    {type: 'data', timestamp: 1519862400000, os: 'mac', browser: 'firefox', min_response_time: 0.3, max_response_time: 1.2}
                    {type: 'data', timestamp: 1519862400000, os: 'linux', browser: 'firefox', min_response_time: 0.1, max_response_time: 1.0}
                    {type: 'data', timestamp: 1519862460000, os: 'linux', browser: 'chrome', min_response_time: 0.2, max_response_time: 0.9}
                    {type: 'data', timestamp: 1519862460000, os: 'mac', browser: 'chrome', min_response_time: 0.1, max_response_time: 1.0}
                    {type: 'data', timestamp: 1519862460000, os: 'mac', browser: 'firefox', min_response_time: 0.2, max_response_time: 1.1}
                    {type: 'data', timestamp: 1519862460000, os: 'linux', browser: 'firefox', min_response_time: 0.3, max_response_time: 1.4}
                    {type: 'stop', timestamp: 1519862460000}`;
        var result =
            [["Time",
                "Linux Chrome Min Response Time",
                "Linux Chrome Max Response Time",
                "Mac Chrome Min Response Time",
                "Mac Chrome Max Response Time",
                "Mac Firefox Min Response Time",
                "Mac Firefox Max Response Time",
                "Linux Firefox Min Response Time",
                "Linux Firefox Max Response Time"],
            ["00:00", 0.1, 1.3, 0.2, 1.2, 0.3, 1.2, 0.1, 1],
            ["00:01", 0.2, 0.9, 0.1, 1, 0.2, 1.1, 0.3, 1.4]];
        var digestor = new DataDigestor(data);
        await expect(digestor.digest()).resolves.toEqual(result);
    });

    it('should ignore a data sequence', async () => {
        var data = `{type: 'start', timestamp: 1519862400000, select: ['min_response_time', 'max_response_time'], group: ['os', 'browser']}
                    {type: 'span', timestamp: 1519862400000, begin: 1519862400000, end: 1519862700000}
                    {type: 'data', timestamp: 1519862400000, os: 'linux', browser: 'chrome', min_response_time: 0.1, max_response_time: 1.3}
                    {type: 'data', timestamp: 1519862400000, os: 'mac', browser: 'chrome', min_response_time: 0.2, max_response_time: 1.2}
                    {type: 'data', timestamp: 1519862400000, os: 'mac', browser: 'firefox', min_response_time: 0.3, max_response_time: 1.2}
                    {type: 'data', timestamp: 1519862400000, os: 'linux', browser: 'firefox', min_response_time: 0.1, max_response_time: 1.0}
                    {type: 'data', timestamp: 1519862460000, os: 'linux', browser: 'chrome', min_response_time: 0.2, max_response_time: 0.9}
                    {type: 'data', timestamp: 1519862460000, os: 'mac', browser: 'chrome', min_response_time: 0.1, max_response_time: 1.0}
                    {type: 'stop', timestamp: 1519862460000}`;
        var result =
            [["Time",
                "Linux Chrome Min Response Time",
                "Linux Chrome Max Response Time",
                "Mac Chrome Min Response Time",
                "Mac Chrome Max Response Time",
                "Mac Firefox Min Response Time",
                "Mac Firefox Max Response Time",
                "Linux Firefox Min Response Time",
                "Linux Firefox Max Response Time"],
            ["00:00", 0.1, 1.3, 0.2, 1.2, 0.3, 1.2, 0.1, 1]];
        var digestor = new DataDigestor(data);
        await expect(digestor.digest()).resolves.toEqual(result);
    });


});