<?php
/**
 * Created by PhpStorm.
 * User: dev
 * Date: 9/7/18
 * Time: 8:50 AM
 */

namespace HawkSearch\Proxy\Block;

use Magento\Framework\View\Element\Template;

class Tabbed extends Html
{
    /**
     * @var \HawkSearch\Proxy\Helper\Data
     */
    private $helper;
    private $labelMap;
    public static $increment = 1;

    public function __construct(
        Template\Context $context,
        \HawkSearch\Proxy\Helper\Data $helper,
        \HawkSearch\Proxy\Block\BannerFactory $bannerFactory,
        array $data = []
    ) {
        parent::__construct($context, $helper, $bannerFactory, $data);
        $this->helper = $helper;
    }

    public function getTabs()
    {
        return $this->helper->getResultData()->getResponseData()->getTabs() ?? null;
    }

    public function getContent()
    {
        return $this->helper->getResultData()->getResponseData()->getResults()->getItems();
    }

    public function getTabbedItemHtml($item)
    {
        $rendererList = $this->getChildBlock('item.renderers');
        $type = 'default';
        if ($this->helper->getShowTypeLabels()
            && $this->getRequest()->getParam('it') != 'all' && isset($item['Custom']['it'])) {
            $type = strstr($item['Custom']['it'], '|^|', true);
        }

        $renderer = $rendererList->getRenderer($type, 'default');
        $renderer->_viewVars = ['item' => $item];
        return $renderer->toHtml();
    }
    public function getIncrement()
    {
        return self::$increment++;
    }

    public function getTypeLabel($item)
    {
        if (!$this->helper->getShowTypeLabels() || !isset($item['Custom']['it'])) {
            return '';
        }
        if (!$this->labelMap) {
            $this->labelMap = $this->helper->getTypeLabelMap();
        }
        $type = strstr($item['Custom']['it'], '|^|', true);

        if (!isset($this->labelMap[$type])) {
            preg_match_all('/tab="(.*?)"/', $this->helper->getResultData()->getResponseData()->getTabs(), $matches);
            if (count($matches) > 0) {
                foreach ($matches[1] as $foundType) {
                    if ($foundType == 'all' || isset($this->labelMap[$foundType])) {
                        continue;
                    }
                    $obj = new \stdClass();
                    $obj->title = ucfirst($foundType);
                    $obj->code = $foundType;
                    $obj->color = $this->helper->generateColor($foundType);
                    $obj->textColor = $this->helper->generateTextColor($obj->color);
                    $this->labelMap[$foundType] = $obj;
                }
            }
        }

        $bg = $this->labelMap[$type]->color;
        $label = $this->labelMap[$type]->title;
        $fg = $this->labelMap[$type]->textColor;
        return sprintf(
            '<p style="background-color: %s; padding: 5px 10px; display:inline-block; font-weight: bold; color: %s">%s</p>',
            $bg,
            $fg,
            $label
        );
    }
}
