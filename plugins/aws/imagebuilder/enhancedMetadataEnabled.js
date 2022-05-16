var async = require('async');
var helpers = require('../../../helpers/aws');

module.exports = {
    title: 'Enhanced Metadata Collection Enabled',
    category: 'Imagebuilder',
    domain: 'compute',
    severity: 'LOW',
    description: 'Ensure that enhanced metadata collection is enabled for image pipelines.',
    more_info: 'Image Builder is a fully managed AWS service that makes it easier to automate the creation, management, and deployment of customized, secure, and up-to-date server images that are pre-installed and pre-configured with software and settings to meet specific IT standards.',
    link: 'https://docs.aws.amazon.com/imagebuilder/latest/userguide/start-build-image-pipeline.html',
    recommended_action: 'Enable enhanced metadata collection for image pipeline.',
    apis: ['Imagebuilder:listImagePipelines'],
    run: function(cache, settings, callback) {
        var results = [];
        var source = {};
        var regions = helpers.regions(settings);
        async.each(regions.imagebuilder, function(region, rcb){
            var listImagePipelines = helpers.addSource(cache, source,
                ['imagebuilder', 'listImagePipelines', region]);
            
            if (!listImagePipelines) return rcb();

            if (listImagePipelines.err || !listImagePipelines.data) {
                helpers.addResult(results, 3,
                    'Unable to list image pipeline: ' + helpers.addError(listImagePipelines), region);
                return rcb();
            }

            if (!listImagePipelines.data.length) {
                helpers.addResult(results, 0,
                    'No image pipeline list found', region);
                return rcb();
            }

            for (let image of listImagePipelines.data) {
                if (!image.arn) continue;

                let resource = image.arn;

                if (image.enhancedImageMetadataEnabled == true) {
                    helpers.addResult(results, 0,
                        'Image pipeline has enhanced metadata collection enabled',
                        region, resource);
                } else {
                    helpers.addResult(results, 2,
                        'Image pipeline does not have enhanced metadata collection enabled',
                        region, resource);
                }
            }

            rcb();
        }, function(){
            callback(null, results, source);
        });
    }
};
