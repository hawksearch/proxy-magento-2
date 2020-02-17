<?php

namespace HawkSearch\Proxy\Controller\ImageCache;


use Magento\Catalog\Helper\Image;
use Magento\Catalog\Model\ResourceModel\Product\Collection;
use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\Controller\ResultFactory;

class Checksum extends Action {
    /**
     * @var Collection
     */
    private $productCollection;
    /**
     * @var Image
     */
    private $image;

    public function __construct(
        Collection $productCollection,
        Image $image,
        Context $context)
    {
        parent::__construct($context);
        $this->productCollection = $productCollection;
        $this->image = $image;
    }

    public function execute()
    {
        $res = $this->resultFactory->create(ResultFactory::TYPE_JSON);
        try {
            $this->productCollection->addAttributeToSelect('small_image');
            $this->productCollection->addAttributeToFilter('small_image', array('notnull' => true));
            $this->productCollection->getSelect()->limit(100);
            $path = '';
            $found = false;
            foreach ($this->productCollection as $product) {
                $path = $this->image->init($product, 'hawksearch_autosuggest_image')->getUrl();
                if (strpos($path, '/cache/') !== false) {
                    $found = true;
                    break;
                }
            }

            if($found) {
                $imageArray = explode("/", $path);
                $cache_key = "";
                foreach ($imageArray as $part) {
                    if (preg_match('/[0-9a-fA-F]{32}/', $part)) {
                        $cache_key = $part;
                    }
                }

                $data['cache_key'] = $cache_key;
                $data['date_time'] = date('Y-m-d H:i:s');
            } else {
                $data['error'] = true;
                $data['message'] = 'CacheKey not found';
            }
        } catch (\Exception $e) {
            $data['error'] = true;
            $data['message'] = $e->getMessage();
        }

        $res->setData($data);
        return $res;
    }
}
